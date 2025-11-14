import type {Request as expressRequest} from 'express';


export interface Request extends expressRequest  {
  user: {
    email: string, 
    id: string, 
    role: string
  };
}
