import  { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { client } from '@repo/db/src/client';
import { CreateUserSchema } from '@repo/common/src/types';


// Define the schema for signup validation


type SignupRequestBody = z.infer<typeof CreateUserSchema>;

export default async function signupController (req: Request, res: Response):any => {
  try {
    // Validate request body
    const validatedData = CreateUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await client.user.findUnique({
      data: { email: validatedData.email }
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);
    
    // Create new user in database
    const newUser = await client.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword
      }
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userWithoutPassword
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string> = {};
      error.errors.forEach(err => {
        if (err.path) {
          formattedErrors[err.path[0]] = err.message;
        }
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
    }
    
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred'
    });
  }
}

