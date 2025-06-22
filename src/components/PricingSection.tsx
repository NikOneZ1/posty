import React from "react"

const plans = [
  {
    name: "Starter",
    price: "$8.99",
    ideas: 200,
    drafts: 200,
    lqImages: 20,
    hqImages: 5,
    projects: 1,
  },
  {
    name: "Creator",
    price: "$18.99",
    ideas: 400,
    drafts: 400,
    lqImages: 50,
    hqImages: 20,
    projects: 5,
  },
  {
    name: "Studio",
    price: "$45",
    ideas: 1000,
    drafts: 800,
    lqImages: 100,
    hqImages: 100,
    projects: 20,
  },
] as const

export default function PricingSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-base-content text-center mb-10">Pricing</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="bg-base-100 border border-base-300 rounded-lg p-6 text-center shadow-sm"
          >
            <h3 className="text-xl font-semibold text-base-content mb-2">
              {plan.name}
            </h3>
            <div className="text-4xl font-bold text-base-content mb-4">
              {plan.price}
            </div>
            <ul className="space-y-1 text-sm text-base-content/70 text-left">
              <li>{plan.ideas} ideas generation</li>
              <li>{plan.drafts} drafts generated/refined</li>
              <li>{plan.lqImages} lq images (coming soon)</li>
              <li>{plan.hqImages} hq images (coming soon)</li>
              <li>{plan.projects} project{plan.projects > 1 ? "s" : ""}</li>
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
