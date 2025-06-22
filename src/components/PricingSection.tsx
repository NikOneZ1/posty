"use client"

import React from "react"

interface Plan {
  name: string
  price: string
  ideaLimit: number
  draftLimit: number
  lqImages: number
  hqImages: number
  projects: number
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "$8.99",
    ideaLimit: 200,
    draftLimit: 200,
    lqImages: 20,
    hqImages: 5,
    projects: 1,
  },
  {
    name: "Creator",
    price: "$18.99",
    ideaLimit: 400,
    draftLimit: 400,
    lqImages: 50,
    hqImages: 20,
    projects: 5,
  },
  {
    name: "Studio",
    price: "$45",
    ideaLimit: 1000,
    draftLimit: 800,
    lqImages: 100,
    hqImages: 100,
    projects: 20,
  },
]

export default function PricingSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-base-content text-center mb-10">
        Pricing
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="card bg-base-100 border border-base-200 rounded-xl shadow-sm"
          >
            <div className="card-body items-center text-center space-y-4">
              <h3 className="text-xl font-semibold text-base-content">
                {plan.name}
              </h3>
              <div className="text-4xl font-bold text-base-content">
                {plan.price}
              </div>
              <ul className="space-y-1 text-base-content/70 text-sm">
                <li>{plan.ideaLimit} ideas generation</li>
                <li>{plan.draftLimit} drafts generated/refined</li>
                <li>
                  {plan.lqImages} lq images generated <span className="italic">(coming soon)</span>
                </li>
                <li>
                  {plan.hqImages} hq images generated <span className="italic">(coming soon)</span>
                </li>
                <li>{plan.projects} project{plan.projects > 1 ? "s" : ""}</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
