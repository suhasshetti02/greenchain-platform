/**
 * WhatsApp Click-to-Chat Utilities
 * Generates privacy-safe WhatsApp links for donor-receiver communication
 */

/**
 * Validates and formats phone number
 * @param {string} phone - Phone number with country code
 * @returns {string|null} - Formatted phone or null if invalid
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Validate length (10-15 digits)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return null;
  }
  
  return cleaned;
}

/**
 * Generates WhatsApp Click-to-Chat URL
 * @param {string} phone - Phone number with country code
 * @param {string} message - Pre-filled message
 * @returns {string|null} - WhatsApp URL or null if invalid
 */
function generateWhatsAppLink(phone, message = '') {
  const formattedPhone = formatPhoneNumber(phone);
  
  if (!formattedPhone) {
    return null;
  }
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}${message ? `?text=${encodedMessage}` : ''}`;
}

/**
 * Creates a standard claim coordination message
 * @param {string} receiverName - Name of the receiver/NGO
 * @param {string} donationTitle - Title of the claimed donation
 * @param {string} ngoName - Optional NGO name
 * @returns {string} - Formatted message
 */
function createClaimMessage(receiverName, donationTitle, ngoName = '') {
  const org = ngoName ? ` from ${ngoName}` : '';
  return `Hello, this is ${receiverName}${org}. We have claimed your donation "${donationTitle}" on GreenChain and would like to coordinate the pickup. Thank you for your contribution!`;
}

/**
 * Creates a donor response message
 * @param {string} donorName - Name of the donor
 * @param {string} donationTitle - Title of the donation
 * @returns {string} - Formatted message
 */
function createDonorMessage(donorName, donationTitle) {
  return `Hello, this is ${donorName}. Thank you for claiming my donation "${donationTitle}" on GreenChain. Let's coordinate the pickup details.`;
}

module.exports = {
  formatPhoneNumber,
  generateWhatsAppLink,
  createClaimMessage,
  createDonorMessage,
};
