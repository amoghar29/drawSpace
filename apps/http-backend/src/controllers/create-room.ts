import  { Request, Response } from 'express';


export default async function roomController (req: Request, res: Response):Promise<any> => {
   return res.status(200).json({
    roomId : '1234'
   })
}

