"use client";

import { Server, Laptop2, CheckCircle2 } from "lucide-react";

const infraItems = [
  "Server Monitoring & Management",
  "Network Setup & Optimization",
  "Backup & Disaster Recovery",
  "System Performance Tuning",
];

const devItems = [
  "Web Application Development",
  "Workflow Automation Systems",
  "UI/UX Design & Prototyping",
  "REST & GraphQL API Development",
];

export default function WhatWeDeliverSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-14" suppressHydrationWarning data-arx="fade-up">
          <p className="text-gold-400 font-semibold font-poppins text-sm uppercase tracking-wider mb-3">
            Our Expertise
          </p>
          <h2 className="section-title mb-4">What We Deliver</h2>
          <p className="section-subtitle">
            Professional solutions designed for business growth and digital
            efficiency.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* IT Infrastructure */}
          <div
            suppressHydrationWarning data-arx="fade-right"
            className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gold-400/10 rounded-lg flex items-center justify-center">
                <Server size={20} className="text-gold-400" />
              </div>
              <h3 className="font-poppins font-bold text-xl text-navy-900 dark:text-white">
                IT Infrastructure & Support
              </h3>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              We manage IT infrastructure, servers, network monitoring, backups,
              troubleshooting, and performance optimisation for businesses.
            </p>
            <ul className="space-y-3">
              {infraItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <CheckCircle2 size={17} className="text-gold-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Dev & Automation */}
          <div
            suppressHydrationWarning data-arx="fade-left"
            data-arx-delay="100"
            className="bg-navy-900 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gold-400/10 rounded-lg flex items-center justify-center">
                <Laptop2 size={20} className="text-gold-400" />
              </div>
              <h3 className="font-poppins font-bold text-xl text-white">
                Development & Automation
              </h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We create custom digital solutions that automate workflows, improve
              productivity, and enhance customer experience through modern tech.
            </p>
            <ul className="space-y-3">
              {devItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-200">
                  <CheckCircle2 size={17} className="text-gold-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

