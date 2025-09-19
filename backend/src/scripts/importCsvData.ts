// backend/src/scripts/importCsvData.ts
import fs from 'fs';
import { supabase } from '../config/supabase';

// csv-parser 대신 readline 사용하는 방법
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

interface CsvRow {
  name: string;
  region: string;
  city: string;
  category: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  price_range: string;
  duration_hours: string;
  companion_type: string;
  tags: string;
  rating: string;
  image_url: string;
  score: string;
  avg_stay_minutes: string;
  entry_fee: string;
  place_type: string;
}

interface ProcessedDestination {
  name: string;
  region: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  price_range: string;
  duration_hours: number;
  companion_type: string[];
  tags: string[];
  rating: number;
  image_url: string;
  score: number;
  avg_stay_minutes: number;
  entry_fee: number;
  place_type: string;
  created_at: string;
  city_id: number | null;
}

interface DataStats {
  [key: string]: number;
}

class CsvDataImporter {
  private destinations: ProcessedDestination[] = [];

  async importData(csvFilePath: string): Promise<void> {
    console.log('📁 CSV 파일 읽기 시작:', csvFilePath);

    return new Promise((resolve, reject) => {
      const fileStream = createReadStream(csvFilePath);
      const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      let headers: string[] = [];
      let isFirstLine = true;

      rl.on('line', (line) => {
        try {
          if (isFirstLine) {
            headers = this.parseCsvLine(line);
            isFirstLine = false;
            return;
          }

          const values = this.parseCsvLine(line);
          const row = this.createRowObject(headers, values);
          const processedRow = this.processRow(row);
          this.destinations.push(processedRow);
        } catch (error) {
          console.error('❌ 라인 처리 에러:', line.substring(0, 50), (error as Error).message);
        }
      });

      rl.on('close', async () => {
        console.log(`📊 총 ${this.destinations.length}개 데이터 처리 완료`);
        
        try {
          await this.insertToDatabase();
          await this.printDataStats();
          console.log('🎉 모든 데이터 임포트 완료!');
          resolve();
        } catch (error) {
          console.error('❌ DB 삽입 에러:', error);
          reject(error);
        }
      });

      rl.on('error', (error) => {
        console.error('❌ CSV 읽기 에러:', error);
        reject(error);
      });
    });
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private createRowObject(headers: string[], values: string[]): CsvRow {
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row as CsvRow;
  }

  private processRow(row: CsvRow): ProcessedDestination {
    return {
      name: row.name.trim(),
      region: row.region.trim(),
      category: row.category.trim(),
      description: row.description.trim(),
      address: row.address.trim(),
      latitude: this.parseFloat(row.latitude),
      longitude: this.parseFloat(row.longitude),
      price_range: row.price_range.trim(),
      duration_hours: this.parseInt(row.duration_hours),
      companion_type: this.parseJsonArray(row.companion_type),
      tags: this.parseJsonArray(row.tags),
      rating: this.parseFloat(row.rating),
      image_url: row.image_url.trim(),
      score: this.parseFloat(row.score),
      avg_stay_minutes: this.parseInt(row.avg_stay_minutes),
      entry_fee: this.parseInt(row.entry_fee),
      place_type: row.place_type.trim(),
      created_at: new Date().toISOString(),
      city_id: null
    };
  }

  private parseJsonArray(jsonString: string): string[] {
    try {
      // "[""family"",""couple""]" → ["family", "couple"]
      const cleanedString = jsonString.replace(/""/g, '"');
      const parsed = JSON.parse(cleanedString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('⚠️ JSON 파싱 실패:', jsonString, (error as Error).message);
      return [];
    }
  }

  private parseFloat(value: string): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  private parseInt(value: string): number {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  private async insertToDatabase(): Promise<void> {
    const batchSize = 50;
    
    for (let i = 0; i < this.destinations.length; i += batchSize) {
      const batch = this.destinations.slice(i, i + batchSize);
      
      console.log(`📤 배치 ${Math.floor(i/batchSize) + 1} 업로드 중... (${batch.length}개)`);
      
      const { data, error } = await supabase
        .from('travel_destinations')
        .insert(batch);
        
      if (error) {
        console.error(`❌ 배치 ${Math.floor(i/batchSize) + 1} 삽입 에러:`, error);
        throw error;
      } else {
        console.log(`✅ 배치 ${Math.floor(i/batchSize) + 1} 삽입 완료`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async printDataStats(): Promise<void> {
    try {
      const { data: stats, error } = await supabase
        .from('travel_destinations')
        .select('region, category, price_range')
        .limit(1000);
      
      if (error) {
        console.error('❌ 통계 조회 에러:', error);
        return;
      }

      if (!stats) {
        console.log('📊 통계 데이터가 없습니다.');
        return;
      }
      
      console.log('\n📈 데이터 통계:');
      
      const regionStats = this.calculateStats(stats, 'region');
      console.log('🌏 지역별:', regionStats);
      
      const categoryStats = this.calculateStats(stats, 'category');
      console.log('🏷️ 카테고리별:', categoryStats);
      
      const priceStats = this.calculateStats(stats, 'price_range');
      console.log('💰 가격대별:', priceStats);
      
    } catch (error) {
      console.error('❌ 통계 출력 에러:', (error as Error).message);
    }
  }

  private calculateStats(data: any[], field: string): DataStats {
    return data.reduce((acc: DataStats, item: any) => {
      const key = item[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  validateData(): string[] {
    const issues: string[] = [];
    
    this.destinations.forEach((dest, index) => {
      const requiredFields: (keyof ProcessedDestination)[] = [
        'name', 'region', 'category', 'description'
      ];
      
      requiredFields.forEach(field => {
        const value = dest[field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          issues.push(`행 ${index + 1}: ${field} 필드가 비어있음`);
        }
      });
      
      if (dest.latitude === 0 || dest.longitude === 0) {
        issues.push(`행 ${index + 1}: 좌표 데이터 누락 (${dest.name})`);
      }
      
      if (dest.rating < 0 || dest.rating > 5) {
        issues.push(`행 ${index + 1}: 평점 범위 오류 (${dest.rating})`);
      }
      
      if (!dest.tags || dest.tags.length === 0) {
        issues.push(`행 ${index + 1}: 태그가 없음 (${dest.name})`);
      }
    });
    
    return issues;
  }

  analyzeDataBalance(): void {
    const regionCount: DataStats = {};
    const categoryCount: DataStats = {};
    
    this.destinations.forEach(dest => {
      regionCount[dest.region] = (regionCount[dest.region] || 0) + 1;
      categoryCount[dest.category] = (categoryCount[dest.category] || 0) + 1;
    });
    
    console.log('\n📊 데이터 분포 분석:');
    console.log('🌏 지역별 분포:', regionCount);
    console.log('🏷️ 카테고리별 분포:', categoryCount);
    
    const totalCount = this.destinations.length;
    const recommendations: string[] = [];
    
    const idealRegionDistribution: Record<string, number> = {
      'SEL': 0.35,  // 서울 35%
      'SDG': 0.25,  // 수도권 25%
      'GWD': 0.1,   // 강원도 10%
      'CCD': 0.1,   // 충청도 10%
      'GSD': 0.1,   // 경상도 10%
      'JLD': 0.05,  // 전라도 5%
      'JJD': 0.05   // 제주도 5%
    };
    
    Object.entries(idealRegionDistribution).forEach(([region, idealRatio]) => {
      const actualCount = regionCount[region] || 0;
      const actualRatio = actualCount / totalCount;
      
      if (Math.abs(actualRatio - idealRatio) > 0.1) {
        recommendations.push(
          `${region} 지역: 현재 ${actualCount}개 (${(actualRatio * 100).toFixed(1)}%), ` +
          `권장 ${Math.round(totalCount * idealRatio)}개 (${(idealRatio * 100).toFixed(1)}%)`
        );
      }
    });
    
    if (recommendations.length > 0) {
      console.log('\n💡 분포 개선 권장사항:');
      recommendations.forEach(rec => console.log(`   ${rec}`));
    } else {
      console.log('\n✅ 데이터 분포가 양호합니다!');
    }
  }
}

async function main(): Promise<void> {
  const csvFilePath = process.argv[2] || 'travel_data.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV 파일을 찾을 수 없습니다: ${csvFilePath}`);
    console.log('💡 사용법: npm run import-csv <csv파일경로>');
    process.exit(1);
  }
  
  const importer = new CsvDataImporter();
  
  try {
    console.log('🚀 CSV 데이터 임포트 시작...\n');
    
    await importer.importData(csvFilePath);
    
    console.log('\n🔍 데이터 검증 중...');
    const issues = importer.validateData();
    
    if (issues.length > 0) {
      console.log('⚠️ 발견된 이슈들:');
      issues.slice(0, 10).forEach(issue => console.log(`   ${issue}`));
      if (issues.length > 10) {
        console.log(`   ... 외 ${issues.length - 10}개 더`);
      }
    } else {
      console.log('✅ 데이터 검증 완료 - 이슈 없음');
    }
    
    importer.analyzeDataBalance();
    
    console.log('\n🎉 임포트 프로세스 완료!');
    
  } catch (error) {
    console.error('❌ 임포트 실패:', (error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { CsvDataImporter };