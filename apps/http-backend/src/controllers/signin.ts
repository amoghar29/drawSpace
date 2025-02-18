import { Request, Response,  } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { client } from '@repo/db/src/client';
import { JWT_SECRET} from "@repo/backend-common/config"
import {signinSchema} from "@repo/common/src/types"




// JWT Secret - should be stored in environment variables
const JWT_EXPIRES_IN = '24h';



type SigninRequestBody = z.infer<typeof signinSchema>;

 export default async function signinController (req: Request, res: Response):any => {
  try {
    // Validate request body
    const validatedData = signinSchema.parse(req.body);
    
    // Find user by email
    const user = await client.user.findUnique({
      where: { email: validatedData.email }
    });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Optional: Create refresh token if implementing refresh token flow
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      success: true,
      message: 'Sign in successful',
      data: {
        user: userWithoutPassword,
        token,
        expiresIn: JWT_EXPIRES_IN
      }
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
    
    console.error('Signin error:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred'
    });
  }
}




