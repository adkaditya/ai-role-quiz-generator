import React from 'react'
import Hero from '../../components/user/home/Hero'
import Features from '../../components/user/home/Feature'
import WhyChoose from '../../components/user/home/WhyChoose'
import FAQ from '../../components/user/home/FAQ'
import CTA from '../../components/user/home/CTA'

function HomePage() {
  return (
   <div>
    <Hero />
    <Features />
    <WhyChoose />
    <FAQ />
    <CTA />
   </div>
  )
}

export default HomePage