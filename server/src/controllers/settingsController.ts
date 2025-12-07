import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import { Settings } from '../models/Settings';

// Get system settings
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  let settings = await Settings.findOne();
    
  // If no settings exist, create default settings
  if (!settings) {
    settings = new Settings();
    await settings.save();
  }

  res.json(settings);
});

// Update system settings
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const {
    // General Settings
    websiteName,
    websiteDescription,
    contactEmail,
    contactPhone,
    address,
    timezone,
    currency,
    language,
    
    // Notification Settings
    emailNotifications,
    orderNotifications,
    stockNotifications,
    customerNotifications,
    adminNotifications,
    
    // Security Settings
    sessionTimeout,
    passwordMinLength,
    requireTwoFactor,
    maxLoginAttempts,
    enableCaptcha,
    
    // Payment Settings
    stripeEnabled,
    paypalEnabled,
    cashOnDelivery,
    bankTransfer,
    
    // Shipping Settings
    freeShippingThreshold,
    defaultShippingCost,
    enableTracking,
    shippingZones,
    
    // Appearance Settings
    theme,
    primaryColor,
    logoUrl,
    faviconUrl,
    
    // System Settings (legacy)
    enableDarkMode,
    maintenanceMode,
    debugMode
  } = req.body;

  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = new Settings();
  }

  // Update General Settings
  if (websiteName !== undefined) settings.websiteName = websiteName;
  if (websiteDescription !== undefined) settings.websiteDescription = websiteDescription;
  if (contactEmail !== undefined) settings.contactEmail = contactEmail;
  if (contactPhone !== undefined) settings.contactPhone = contactPhone;
  if (address !== undefined) settings.address = address;
  if (timezone !== undefined) settings.timezone = timezone;
  if (currency !== undefined) settings.currency = currency;
  if (language !== undefined) settings.language = language;
  
  // Update Notification Settings
  if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
  if (orderNotifications !== undefined) settings.orderNotifications = orderNotifications;
  if (stockNotifications !== undefined) settings.stockNotifications = stockNotifications;
  if (customerNotifications !== undefined) settings.customerNotifications = customerNotifications;
  if (adminNotifications !== undefined) settings.adminNotifications = adminNotifications;
  
  // Update Security Settings
  if (sessionTimeout !== undefined) settings.sessionTimeout = sessionTimeout;
  if (passwordMinLength !== undefined) settings.passwordMinLength = passwordMinLength;
  if (requireTwoFactor !== undefined) settings.requireTwoFactor = requireTwoFactor;
  if (maxLoginAttempts !== undefined) settings.maxLoginAttempts = maxLoginAttempts;
  if (enableCaptcha !== undefined) settings.enableCaptcha = enableCaptcha;
  
  // Update Payment Settings
  if (stripeEnabled !== undefined) settings.stripeEnabled = stripeEnabled;
  if (paypalEnabled !== undefined) settings.paypalEnabled = paypalEnabled;
  if (cashOnDelivery !== undefined) settings.cashOnDelivery = cashOnDelivery;
  if (bankTransfer !== undefined) settings.bankTransfer = bankTransfer;
  
  // Update Shipping Settings
  if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;
  if (defaultShippingCost !== undefined) settings.defaultShippingCost = defaultShippingCost;
  if (enableTracking !== undefined) settings.enableTracking = enableTracking;
  if (shippingZones !== undefined && Array.isArray(shippingZones)) {
    settings.shippingZones = shippingZones;
  }
  
  // Update Appearance Settings
  if (theme !== undefined) settings.theme = theme;
  if (primaryColor !== undefined) settings.primaryColor = primaryColor;
  if (logoUrl !== undefined) settings.logoUrl = logoUrl;
  if (faviconUrl !== undefined) settings.faviconUrl = faviconUrl;
  
  // Update System Settings (legacy)
  if (enableDarkMode !== undefined) settings.enableDarkMode = enableDarkMode;
  if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
  if (debugMode !== undefined) settings.debugMode = debugMode;

  await settings.save();

  res.json(settings);
});