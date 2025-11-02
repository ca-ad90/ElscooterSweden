"use client"

import React from "react"

type SectionProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: keyof JSX.IntrinsicElements
  background?: "default" | "muted" | "contrast"
  padding?: "none" | "sm" | "md" | "lg"
  container?: boolean
}

export const Section: React.FC<SectionProps> = ({
  as: As = "section",
  background = "default",
  padding = "md",
  container = true,
  className = "",
  children,
  ...rest
}) => {
  const backgroundClasses =
    background === "muted"
      ? "bg-gray-50 dark:bg-neutral-900"
      : background === "contrast"
      ? "bg-black text-white dark:bg-white dark:text-black"
      : ""

  const paddingClasses =
    padding === "lg"
      ? "py-16 md:py-20"
      : padding === "md"
      ? "py-12 md:py-16"
      : padding === "sm"
      ? "py-8"
      : ""

  const content = (
    <div className={`${backgroundClasses} ${paddingClasses} ${className}`.trim()} {...rest}>
      {container ? <div className="container mx-auto px-4">{children}</div> : children}
    </div>
  )

  return React.createElement(As, { className: undefined }, content)
}

type SectionHeaderProps = React.HTMLAttributes<HTMLDivElement>

export const SectionHeader: React.FC<SectionHeaderProps> = ({ className = "", children, ...rest }) => {
  return (
    <div className={`mb-8 flex flex-col gap-2 text-center md:mb-12 ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

type SectionTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ as: As = "h2", className = "", children, ...rest }) => {
  return (
    <As className={`text-2xl font-semibold tracking-tight md:text-3xl ${className}`.trim()} {...rest}>
      {children}
    </As>
  )
}

type SectionDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export const SectionDescription: React.FC<SectionDescriptionProps> = ({ className = "", children, ...rest }) => {
  return (
    <p className={`mx-auto max-w-2xl text-sm text-gray-600 dark:text-neutral-400 md:text-base ${className}`.trim()} {...rest}>
      {children}
    </p>
  )
}

type SectionActionsProps = React.HTMLAttributes<HTMLDivElement>

export const SectionActions: React.FC<SectionActionsProps> = ({ className = "", children, ...rest }) => {
  return (
    <div className={`mt-6 flex flex-wrap items-center justify-center gap-3 ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

export default Section
