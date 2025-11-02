import createImageUrlBuilder from "@sanity/image-url"
import type { SanityImageSource } from "@sanity/image-url/lib/types/types"

const projectId :string|undefined = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset :string|undefined = process.env.NEXT_PUBLIC_SANITY_DATASET

const builder = createImageUrlBuilder({ projectId: projectId!, dataset: dataset! })

export const urlFor = (source: SanityImageSource) => builder.image(source)
