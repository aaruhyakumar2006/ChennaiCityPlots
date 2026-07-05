import { z } from "zod";

export const leadInputSchema = z.object({
  name: z.string().min(2).max(120),
  mobile: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email(),
  message: z.string().max(1000).optional(),
  propertyId: z.string().optional(),
});

export const siteVisitInputSchema = z.object({
  name: z.string().min(2).max(120),
  mobile: z.string().regex(/^[0-9]{10}$/).optional(),
  date: z.string(), // ISO date string from <input type="date">
  timeSlot: z.string().min(3),
  propertyId: z.string(),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const propertyInputSchema = z.object({
  propertyId: z.string(),
  name: z.string().min(2),
  slug: z.string().min(2),
  type: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  status: z.enum(["READY_TO_MOVE", "UNDER_CONSTRUCTION"]),
  location: z.string().min(2),
  price: z.number().int().positive(),
  description: z.string().min(10),
  amenities: z.array(z.string()).default([]),
  featured: z.boolean().optional(),
});
