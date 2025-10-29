import { Github } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"


const Hero = () => {
  return (
    <div id="hero-container" className="h-[100vh] w-full border-b border-ui-border-base relative overflow-hidden p-8 flex items-end ">
      <video id="myVideo" className="absolute video-bg fill visible z-[-1]" autoPlay muted loop playsInline >
        <source src="/ess-hero-vid.mp4" type="video/mp4" />
      </video>
      <div className="flex flex-col small:p-32 gap-6 pb-20 drop-shadow-2xl ">
        <h1 id="#main-title" className="secondary-text clr-s-700 drop-shadow drop-shadow-md">Elscooter Sweden</h1>
        <h2 id="#main-subtitle" className="accent-text font-light font-secondary clr-p-800">
Sweden's leading provider of electric scooters        </h2>
      </div>
    </div>
  )
}

export default Hero
