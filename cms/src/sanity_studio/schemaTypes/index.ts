import { SchemaPluginOptions } from "sanity"
/*
import productSchema from "./documents/products_old"
import PersonSchema from "./documents/Product2_old"
  //templates: (templates) =>
   templates.filter((template) => template.schemaType !== "product"),
*/

import product from "./documents/product"
import variants from "./documents/variant"
import tags from "./documents/tags"
import category from "./documents/category"
import typeSchema from "./documents/typeSchema"
import page from "./documents/page"
import homePage from "./documents/homePage"
import navigationItem from "./documents/navigationItem"
import siteSettings from "./documents/siteSettings"
import review from "./documents/review"
import blogPost from "./documents/blogPost"

import seo from "./objects/seo"
import heroSection from "./objects/heroSection"
import richTextBlock from "./objects/richTextBlock"
//import imageGallery from "./objects/imageGallery"
import productCarousel from "./objects/productCarousel"
import ctaSection from "./objects/ctaSection"
import faqSection from "./objects/faqSection"
import banner from "./objects/banner"
import featuredCollection from "./objects/featuredCollection"


export const schema: SchemaPluginOptions = {
  types: [
    product,
    tags,
    category,
    variants,
    typeSchema,
    page,
    homePage,
    navigationItem,
    siteSettings,
    review,
    blogPost,
    seo,
    heroSection,
    richTextBlock,
    productCarousel,
    ctaSection,
    faqSection,
    banner,
    featuredCollection,
  ],

}
