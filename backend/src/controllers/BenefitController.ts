import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class BenefitController {
  static async getBenefits(req: Request, res: Response): Promise<void> {
    try {
      const { category, region } = req.query;
      
      let query = supabase
        .from('benefits')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }
      
      if (region) {
        query = query.eq('region', region);
      }

      const { data, error } = await query;

      if (error) {
        res.status(500).json({ error: 'Database error' });
        return;
      }

      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getBenefitById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        res.status(404).json({ error: 'Benefit not found' });
        return;
      }

      res.json({ success: true, data: data });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // 기존 메서드들...
  static async getYouthBenefits(req: Request, res: Response) {
    // 기존 코드...
  }

  static async getRegionalDiscounts(req: Request, res: Response) {
    // 기존 코드...
  }
}