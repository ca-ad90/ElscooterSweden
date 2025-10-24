"use client"

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import { visionTool } from "@sanity/vision"
import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import {
  dashboardTool,
  sanityTutorialsWidget,
  projectUsersWidget,
  projectInfoWidget,
} from "@sanity/dashboard"

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from "./src/sanity_studio/env"
import { schema } from "./src/sanity_studio/schemaTypes"
import { structure } from "./src/sanity_studio/structure"

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  //schema,
  plugins: [
    structureTool(),
    //structureTool({ structure }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    dashboardTool({
      widgets: [
        sanityTutorialsWidget(),
        projectInfoWidget(),
        projectUsersWidget(),
      ],
    }),
  ],
})
