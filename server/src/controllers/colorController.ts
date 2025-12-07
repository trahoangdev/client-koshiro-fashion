import { Request, Response } from 'express';
import Color, { IColor } from '../models/Color';
import { asyncHandler } from '../utils/errorHandler';
import { errors } from '../utils/errorHandler';
import { logger } from '../lib/logger';

// Get all colors
export const getColors = asyncHandler(async (req: Request, res: Response) => {
  const { activeOnly = 'true', language } = req.query;

  const filter: Record<string, unknown> = {};
  if (activeOnly === 'true') {
    filter.isActive = true;
  }

  const colors = await Color.find(filter).sort({ name: 1 });

  // Transform colors based on language preference
  const transformedColors = colors.map(color => ({
    _id: color._id,
    name: language === 'en' ? (color.nameEn || color.name) :
          language === 'ja' ? (color.nameJa || color.name) :
          color.name,
    nameEn: color.nameEn,
    nameJa: color.nameJa,
    hexValue: color.hexValue,
    isActive: color.isActive,
    isDefault: color.isDefault,
    createdAt: color.createdAt,
    updatedAt: color.updatedAt
  }));

  res.json({
    success: true,
    colors: transformedColors,
    total: transformedColors.length
  });
});

// Get color by ID
export const getColor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const color = await Color.findById(id);

  if (!color) {
    throw errors.notFound('Color not found');
  }

  res.json({
    success: true,
    color
  });
});

// Create new color
export const createColor = asyncHandler(async (req: Request, res: Response) => {
  const { name, nameEn, nameJa, hexValue, isActive = true, isDefault = false } = req.body;

  // Validate required fields
  if (!name || !hexValue) {
    throw errors.badRequest('Name and hex value are required');
  }

  // Validate hex format
  if (!/^#[0-9A-Fa-f]{6}$/.test(hexValue) && !/^#[0-9A-Fa-f]{3}$/.test(hexValue)) {
    throw errors.badRequest('Invalid hex color format. Must be #RRGGBB or #RGB');
  }

  // Check if color with same base name already exists (case-insensitive)
  // Only check the primary name field to avoid false positives with multilingual names
  // Escape special regex characters in name
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const trimmedName = name.trim();
  
  // Primary check: exact match on base name (case-insensitive)
  const existingColor = await Color.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, 'i') }
  });

  // If color exists, return it instead of creating duplicate
  if (existingColor) {
    logger.info(`Color creation attempted for existing color: ${trimmedName} (found: ${existingColor.name})`);
    return res.status(200).json({
      success: true,
      message: 'Color already exists, returning existing color',
      color: existingColor,
      isExisting: true
    });
  }

  const color = new Color({
    name: name.trim(),
    nameEn: nameEn?.trim() || undefined,
    nameJa: nameJa?.trim() || undefined,
    hexValue: hexValue.toUpperCase(), // Normalize to uppercase
    isActive: isActive !== undefined ? isActive : true,
    isDefault: isDefault !== undefined ? isDefault : false
  });

  await color.save();
  
  logger.info(`Color created successfully: ${color.name} (${color.hexValue})`);

  res.status(201).json({
    success: true,
    message: 'Color created successfully',
    color,
    isExisting: false
  });
});

// Update color
export const updateColor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, nameEn, nameJa, hexValue, isActive, isDefault } = req.body;

  const color = await Color.findById(id);

  if (!color) {
    throw errors.notFound('Color not found');
  }

  // Validate hex format if provided
  if (hexValue && !/^#[0-9A-Fa-f]{6}$/.test(hexValue) && !/^#[0-9A-Fa-f]{3}$/.test(hexValue)) {
    throw errors.badRequest('Invalid hex color format. Must be #RRGGBB or #RGB');
  }

  // Check for duplicate names if name is being updated
  if (name || nameEn || nameJa) {
    const duplicateFilter: Record<string, unknown> = {
      _id: { $ne: id }
    };

    const orConditions: Record<string, unknown>[] = [];
    if (name) {
      orConditions.push({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    }
    if (nameEn) {
      orConditions.push({ nameEn: { $regex: new RegExp(`^${nameEn}$`, 'i') } });
    }
    if (nameJa) {
      orConditions.push({ nameJa: { $regex: new RegExp(`^${nameJa}$`, 'i') } });
    }

    if (orConditions.length > 0) {
      duplicateFilter.$or = orConditions;
      const existingColor = await Color.findOne(duplicateFilter);
      if (existingColor) {
        throw errors.badRequest('Color with this name already exists');
      }
    }
  }

  // Update fields
  if (name) color.name = name;
  if (nameEn !== undefined) color.nameEn = nameEn;
  if (nameJa !== undefined) color.nameJa = nameJa;
  if (hexValue) color.hexValue = hexValue.toUpperCase();
  if (isActive !== undefined) color.isActive = isActive;
  if (isDefault !== undefined) color.isDefault = isDefault;

  await color.save();

  res.json({
    success: true,
    message: 'Color updated successfully',
    color
  });
});

// Delete color
export const deleteColor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const color = await Color.findById(id);

  if (!color) {
    throw errors.notFound('Color not found');
  }

  // Prevent deletion of default colors
  if (color.isDefault) {
    throw errors.badRequest('Cannot delete default colors');
  }

  // Check if color is being used by any products
  const Product = (await import('../models/Product')).default;
  const productsUsingColor = await Product.distinct('_id', {
    colors: { $in: [color.name] }
  });

  if (productsUsingColor.length > 0) {
    throw errors.badRequest(`Cannot delete color. It is being used by ${productsUsingColor.length} product(s)`);
  }

  await Color.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Color deleted successfully'
  });
});

// Get color by name (any language, case-insensitive)
export const getColorByName = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.params;

  if (!name) {
    throw errors.badRequest('Color name is required');
  }

  // Escape special regex characters
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedName = escapeRegex(name);

  const color = await Color.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${escapedName}$`, 'i') } },
      { nameEn: { $regex: new RegExp(`^${escapedName}$`, 'i') } },
      { nameJa: { $regex: new RegExp(`^${escapedName}$`, 'i') } }
    ]
  });

  if (!color) {
    throw errors.notFound('Color not found');
  }

  res.json({
    success: true,
    color
  });
});

// Get color hex value by name (convenience endpoint)
export const getColorHex = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.params;

  if (!name) {
    throw errors.badRequest('Color name is required');
  }

  const color = await Color.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${name}$`, 'i') } },
      { nameEn: { $regex: new RegExp(`^${name}$`, 'i') } },
      { nameJa: { $regex: new RegExp(`^${name}$`, 'i') } }
    ],
    isActive: true
  });

  if (!color) {
    // Return default gray if color not found
    res.json({
      success: true,
      name,
      hexValue: '#6b7280'
    });
    return;
  }

  res.json({
    success: true,
    name: color.name,
    hexValue: color.hexValue
  });
});

