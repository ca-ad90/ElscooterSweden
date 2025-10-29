import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    }).then(async (response) => {
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.message)
      }

      return json
    })

    if (!regions?.length) {
      throw new Error(
        "No regions found. Please set up regions in your Medusa Admin."
      )
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Detects the country code from various sources (headers, URL, cookies, etc.)
 * @param request
 * @returns The detected country code or null
 */
function detectCountryFromHeaders(request: NextRequest): string | null {
  // Check various platform-specific headers for country detection
  const headersToCheck = [
    "x-vercel-ip-country", // Vercel
    "cf-ipcountry", // Cloudflare
    "cloudfront-viewer-country", // AWS CloudFront
    "x-country-code", // Custom header (if set by your infrastructure)
  ]

  for (const headerName of headersToCheck) {
    const countryCode = request.headers.get(headerName)?.toLowerCase()
    if (countryCode && countryCode.length === 2) {
      return countryCode
    }
  }

  // Try to get from Accept-Language header as a fallback
  // This is less reliable but can provide a hint
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) {
    // Extract country code from locale (e.g., "en-US" -> "us")
    const localeMatch = acceptLanguage.match(/([a-z]{2})-([A-Z]{2})/)
    if (localeMatch && localeMatch[2]) {
      return localeMatch[2].toLowerCase()
    }
  }

  return null
}

/**
 * Gets the country code from cookies (for user preference)
 * @param request
 * @returns The country code from cookies or null
 */
function getCountryFromCookie(request: NextRequest): string | null {
  const countryCookie = request.cookies.get("country_code")
  if (countryCookie?.value) {
    return countryCookie.value.toLowerCase()
  }
  return null
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param regionMap
 * @returns The detected country code
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode: string | undefined

    // Priority order:
    // 1. URL path parameter (user explicitly navigated to a country)
    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    }
    // 2. Cookie (user's saved preference)
    else {
      const cookieCountryCode = getCountryFromCookie(request)
      if (cookieCountryCode && regionMap.has(cookieCountryCode)) {
        countryCode = cookieCountryCode
      }
    }
    // 3. Auto-detect from headers (platform-specific geolocation)
    if (!countryCode) {
      const detectedCountry = detectCountryFromHeaders(request)
      if (detectedCountry && regionMap.has(detectedCountry)) {
        countryCode = detectedCountry
      }
    }
    // 4. Default region from environment variable
    if (!countryCode && regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    }
    // 5. First available region as last resort
    if (!countryCode) {
      const firstRegion = regionMap.keys().next().value
      if (firstRegion) {
        countryCode = firstRegion
      }
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL.",
        error
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")

  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)
  if (request.nextUrl.pathname.startsWith("/studio") || urlHasCountryCode) {
    return NextResponse.next()
  }
  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and redirect
  if (urlHasCountryCode && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })

    return response
  }

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    console.log("redirecting to", `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`)
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)

    // Save the detected country code to cookie for future visits
    // This allows the user's preference to persist across sessions
    response.cookies.set("country_code", countryCode, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Allow client-side access if needed
      sameSite: "lax",
    })

    // Also set cache ID if not already set
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
  } else if (!urlHasCountryCode && !countryCode) {
    // Handle case where no valid country code exists (empty regions)
    return new NextResponse(
      "No valid regions configured. Please set up regions with countries in your Medusa Admin.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
