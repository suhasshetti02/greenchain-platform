"use client";

import { MessageCircle } from "lucide-react";
import Button from "@/components/Button";

/**
 * WhatsApp Click-to-Chat Button
 * Opens WhatsApp with pre-filled message (privacy-safe, no phone displayed)
 */
export default function WhatsAppButton({ phone, message, label = "Chat on WhatsApp", className = "" }) {
  if (!phone) {
    return null;
  }

  const handleClick = () => {
    // Format phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Generate WhatsApp link
    const encodedMessage = encodeURIComponent(message || '');
    const whatsappUrl = `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 ${className}`}
      title="Opens WhatsApp to coordinate pickup"
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </Button>
  );
}
