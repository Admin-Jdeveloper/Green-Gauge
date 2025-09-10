"use client";

import { ArrowRight } from "lucide-react";

export default function AgricultureLandingPage() {
  return (
    <div className="min-h-screen bg-green-50 font-sans">
      

      {/* Hero Section */}
      <section className="relative bg-green-100 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-green-800 mb-4">
            🌾 Smart Agriculture Project
          </h1>
          <p className="text-lg text-green-700 mb-8">
            Revolutionizing farming with technology, data-driven insights, and sustainable practices.
          </p>
          <a
            href="#features"
            className="inline-flex items-center gap-2 bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Learn More <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* Features Section */}
  <section id="features" className="py-20">
  
  <div className="max-w-6xl mx-auto px-6 flex justify-center gap-10">
    <a href="/Rainfall">
    <div className="bg-white shadow-lg w-64 rounded-xl p-6 text-center hover:scale-105 transform transition">
      <h3 className="text-xl font-bold mb-2 text-green-800">Rainfall , Temperature </h3>
      <p className="text-gray-700">
        You can Calculate risk of crop damage due to adverse weather conditions.
      </p>
    </div>
    </a>
    <a href="/Investment_Analysis">
    <div className="bg-white shadow-lg w-64 rounded-xl p-6 text-center hover:scale-105 transform transition">
      <h3 className="text-xl font-bold mb-2 text-green-800">Terrain investement</h3>
      <p className="text-gray-700">
        You can Analyze terrain data to recommend optimal investment strategies for farmers.
      </p>
    </div>
    </a>
    {/* Uncomment if needed */}
    {/* <div className="bg-white shadow-lg w-64 rounded-xl p-6 text-center hover:scale-105 transform transition">
      <h3 className="text-xl font-bold mb-2 text-green-800">Crop Recommendations</h3>
      <p className="text-gray-700">
        AI-driven suggestions for best crops, fertilizers, and irrigation methods.
      </p>
    </div> */}
   
  </div>
</section>

      {/* CTA Section */}
      <section className="py-20 bg-green-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-green-900 mb-4">
            Ready to Transform Your Farm?
          </h3>
          <p className="text-green-800 mb-6">
            Join our platform today and start leveraging smart agriculture tools for better yields.
          </p>
          <a
            href="#"
            className="inline-block bg-green-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-800 transition"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-100 py-6 text-center text-green-800 font-semibold">
        © {new Date().getFullYear()} Smart Agriculture Project. All rights reserved.
      </footer>
    </div>
  );
}
