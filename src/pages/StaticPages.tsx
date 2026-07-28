import React from 'react';
import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">About IndeMarket</h1>
      <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
        <p className="text-lg">
          Welcome to IndeMarket, the premier online marketplace connecting buyers and independent sellers across the region.
        </p>
        <p>
          Our mission is to empower local businesses and entrepreneurs by providing them with a robust, easy-to-use platform to showcase their products to a wider audience. We believe in fostering a community-driven economy where quality goods meet eager customers seamlessly.
        </p>
        <p>
          Whether you are looking for electronics, fashion, or everyday essentials, our diverse range of verified sellers has you covered. Thank you for supporting independent commerce!
        </p>
        <div className="mt-8">
          <Link to="/" className="text-indigo-600 font-bold hover:underline">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export function Support() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Help & Support</h1>
      <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
        <p className="text-lg">Need help with your order or setting up your seller account? We're here for you.</p>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-2">Contact Us</h3>
          <p>Email: <a href="mailto:support@indemarket.demo" className="text-indigo-600 hover:underline">support@indemarket.demo</a></p>
          <p>Phone: +265 (0) 999 123 456</p>
        </div>
        <div className="mt-8">
          <h3 className="font-bold text-gray-900 text-lg mb-2">Frequently Asked Questions</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>How do I become a seller?</strong> Register and select the "Seller" account type.</li>
            <li><strong>How long does delivery take?</strong> Delivery times vary by seller, typically 2-5 business days.</li>
            <li><strong>What is your refund policy?</strong> Contact the seller directly within 7 days of receiving your item.</li>
          </ul>
        </div>
        <div className="mt-8">
          <Link to="/" className="text-indigo-600 font-bold hover:underline">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Terms of Service</h1>
      <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
        <p>Last updated: July 2026</p>
        <p>By accessing or using IndeMarket, you agree to be bound by these terms.</p>
        <h3 className="font-bold text-gray-900 text-lg mt-6">1. User Accounts</h3>
        <p>You must provide accurate information when creating an account. You are responsible for safeguarding your password.</p>
        <h3 className="font-bold text-gray-900 text-lg mt-6">2. Seller Obligations</h3>
        <p>Sellers must only list items they have the legal right to sell and must accurately describe their products. Sellers are responsible for fulfilling orders in a timely manner.</p>
        <h3 className="font-bold text-gray-900 text-lg mt-6">3. Prohibited Items</h3>
        <p>The sale of illegal, hazardous, or counterfeit items is strictly prohibited.</p>
        <div className="mt-8">
          <Link to="/" className="text-indigo-600 font-bold hover:underline">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
      <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
        <p>Last updated: July 2026</p>
        <p>Your privacy is important to us. This policy outlines how we handle your data.</p>
        <h3 className="font-bold text-gray-900 text-lg mt-6">Data Collection</h3>
        <p>We collect information you provide directly to us when you create an account, place an order, or communicate with us.</p>
        <h3 className="font-bold text-gray-900 text-lg mt-6">Use of Data</h3>
        <p>We use your data to provide, maintain, and improve our services, process transactions, and send related information.</p>
        <h3 className="font-bold text-gray-900 text-lg mt-6">Data Sharing</h3>
        <p>We share necessary information with sellers to fulfill your orders. We do not sell your personal data to third parties.</p>
        <div className="mt-8">
          <Link to="/" className="text-indigo-600 font-bold hover:underline">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
