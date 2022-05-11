import { Request, Response } from 'express'

export interface MyCtx {
    req: Request
    res: Response
}
