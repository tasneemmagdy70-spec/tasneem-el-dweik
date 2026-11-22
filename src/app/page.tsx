import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ProjectsGrid from "@/components/ProjectsGrid";
import WhatIDo from "@/components/WhatIDo";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProjectsGrid />
        <WhatIDo />
        <Contact />
      </main>
    </>
  );
}
