import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { FirebaseService } from '../../infrastructure/firebase';
import { User } from '../../iam/users/entities/user.entity';
import {
  DashboardResponse,
  DashboardMetrics,
  DefectAnalysis,
  AttendanceRecord,
} from './types';

interface LoteDocument {
  quantity?: number;
  okCount?: number;
  rejectedCount?: number;
  reworkOkCount?: number;
  reworkRejectedCount?: number;
  rejectedDefectNames?: string[];
  defectNames?: string[];
  inspectorId?: string;
  createdAt?: { toDate: () => Date } | Date | string;
}

interface AttendanceDocument {
  date?: string;
  checkIn?: string;
  checkOut?: string;
  inspectorId?: string;
  status?: string;
  notes?: string;
}

@Injectable()
export class ProductionDashboardService {
  private readonly logger = new Logger(ProductionDashboardService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async getDashboardSummary(
    company?: string,
    plant?: string,
    currentUser?: User,
    quoteId?: string,
  ): Promise<DashboardResponse> {
    const targetCompany = company;
    const targetPlant = plant;

    if (!targetCompany || !targetPlant) {
      return this.getEmptyResponse();
    }

    const { shiftStart, shiftEnd } = this.getCurrentShiftRange();

    const [inspections, attendanceData, quoteMetrics] = await Promise.all([
      this.fetchInspections(targetCompany, targetPlant, shiftStart, shiftEnd),
      this.fetchAttendanceMetrics(targetCompany, targetPlant),
      quoteId ? this.fetchQuoteMetrics(quoteId) : Promise.resolve(null),
    ]);

    return this.aggregateMetrics(
      inspections,
      attendanceData.totalHoursWorked,
      attendanceData.records,
      quoteMetrics,
    );
  }

  private getCurrentShiftRange(): { shiftStart: Date; shiftEnd: Date } {
    const now = new Date();

    const mexicoOffset = -6 * 60;
    const localOffset = now.getTimezoneOffset();
    const offsetDiff = mexicoOffset - localOffset;

    const mexicoNow = new Date(now.getTime() + offsetDiff * 60 * 1000);
    const currentHour = mexicoNow.getHours();

    let shiftStart: Date;
    let shiftEnd: Date;

    if (currentHour >= 6 && currentHour < 18) {
      shiftStart = new Date(mexicoNow);
      shiftStart.setHours(6, 0, 0, 0);

      shiftEnd = new Date(mexicoNow);
      shiftEnd.setHours(18, 0, 0, 0);
    } else {
      if (currentHour >= 18) {
        shiftStart = new Date(mexicoNow);
        shiftStart.setHours(18, 0, 0, 0);

        shiftEnd = new Date(mexicoNow);
        shiftEnd.setDate(shiftEnd.getDate() + 1);
        shiftEnd.setHours(6, 0, 0, 0);
      } else {
        shiftStart = new Date(mexicoNow);
        shiftStart.setDate(shiftStart.getDate() - 1);
        shiftStart.setHours(18, 0, 0, 0);

        shiftEnd = new Date(mexicoNow);
        shiftEnd.setHours(6, 0, 0, 0);
      }
    }

    const shiftStartUTC = new Date(
      shiftStart.getTime() - offsetDiff * 60 * 1000,
    );
    const shiftEndUTC = new Date(shiftEnd.getTime() - offsetDiff * 60 * 1000);

    return { shiftStart: shiftStartUTC, shiftEnd: shiftEndUTC };
  }

  private async fetchInspections(
    company: string,
    plant: string,
    shiftStart: Date,
    shiftEnd: Date,
  ): Promise<LoteDocument[]> {
    try {
      const collectionRef = this.firebaseService.getCollectionRef(
        company,
        plant,
        'puertas',
      );

      // TODO: Descomentar filtros de turno para producción
      // const snapshot = await collectionRef
      //   .where('createdAt', '>=', shiftStart)
      //   .where('createdAt', '<', shiftEnd)
      //   .get();

      // TEMPORAL: Trae todos los documentos históricos para pruebas visuales
      const snapshot = await collectionRef.get();

      if (snapshot.empty) {
        this.logger.debug(
          `No inspections found for ${company}/${plant} in current shift`,
        );
        return [];
      }

      return snapshot.docs.map((doc) => doc.data() as LoteDocument);
    } catch (error) {
      this.logger.error(
        `Error fetching inspections for ${company}/${plant}: ${error.message}`,
      );
      return [];
    }
  }

  private async fetchAttendanceMetrics(
    company: string,
    plant: string,
  ): Promise<{ totalHoursWorked: number; records: AttendanceRecord[] }> {
    try {
      const attendanceRef = this.firebaseService.getCollectionRef(
        company,
        plant,
        'attendance',
      );
      const inspectoresRef = this.firebaseService.getCollectionRef(
        company,
        plant,
        'inspectores',
      );

      const [attendanceSnapshot, inspectoresSnapshot] = await Promise.all([
        attendanceRef.get(),
        inspectoresRef.get(),
      ]);

      const inspectorNames: Record<string, string> = {};
      inspectoresSnapshot.forEach((doc) => {
        inspectorNames[doc.id] = doc.data().name || 'Sin nombre';
      });

      if (attendanceSnapshot.empty) {
        this.logger.debug(
          `No attendance records found for ${company}/${plant}`,
        );
        return { totalHoursWorked: 0, records: [] };
      }

      const attendanceDocs = attendanceSnapshot.docs.map(
        (doc) => doc.data() as AttendanceDocument,
      );

      const totalHoursWorked = this.calculateTotalHours(attendanceDocs);

      const records: AttendanceRecord[] = attendanceDocs.map((doc) => {
        let hoursWorked: number | undefined = undefined;

        if (doc.checkIn && doc.checkOut) {
          const checkInMinutes = this.timeStringToMinutes(doc.checkIn);
          const checkOutMinutes = this.timeStringToMinutes(doc.checkOut);

          if (checkInMinutes !== null && checkOutMinutes !== null) {
            let diff = checkOutMinutes - checkInMinutes;
            if (diff < 0) {
              diff += 24 * 60;
            }
            hoursWorked = Math.round((diff / 60) * 100) / 100;
          }
        }

        const inspectorId = doc.inspectorId || '';

        return {
          date: doc.date || '',
          checkIn: doc.checkIn || '',
          checkOut: doc.checkOut,
          inspectorId,
          inspectorName: inspectorNames[inspectorId] || 'Desconocido',
          status: doc.status || '',
          notes: doc.notes || undefined,
          hoursWorked,
        };
      });

      return { totalHoursWorked, records };
    } catch (error) {
      this.logger.error(
        `Error fetching attendance for ${company}/${plant}: ${error.message}`,
      );
      return { totalHoursWorked: 0, records: [] };
    }
  }

  private calculateTotalHours(records: AttendanceDocument[]): number {
    let totalMinutes = 0;

    for (const record of records) {
      const checkIn = record.checkIn;
      const checkOut = record.checkOut;

      if (!checkIn || !checkOut || checkIn === checkOut) {
        continue;
      }

      const checkInMinutes = this.timeStringToMinutes(checkIn);
      const checkOutMinutes = this.timeStringToMinutes(checkOut);

      if (checkInMinutes === null || checkOutMinutes === null) {
        continue;
      }

      let diff = checkOutMinutes - checkInMinutes;

      if (diff < 0) {
        diff += 24 * 60;
      }

      totalMinutes += diff;
    }

    return Math.round((totalMinutes / 60) * 100) / 100;
  }

  private timeStringToMinutes(time: string): number | null {
    if (!time || typeof time !== 'string') {
      return null;
    }

    const parts = time.split(':');
    if (parts.length < 2) {
      return null;
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) {
      return null;
    }

    return hours * 60 + minutes;
  }

  private getEmptyResponse(): DashboardResponse {
    return {
      metrics: {
        totalInspected: 0,
        approved: 0,
        rejected: 0,
        reworked: 0,
        totalDefects: 0,
      },
      topDefects: [],
      activeInspectors: 0,
      totalHoursWorked: 0,
      quotedPieces: undefined,
      remainingPieces: undefined,
      quotedRate: undefined,
      attendanceRecords: [],
    };
  }

  async fetchQuoteMetrics(quoteId: string): Promise<{
    quotedPieces: number;
    quotedRate: number;
    quoteNumber: string | null;
  } | null> {
    try {
      const doc = await this.firebaseService
        .getQuotesCollectionRef()
        .doc(quoteId)
        .get();

      if (!doc.exists) {
        this.logger.warn(`Quote document not found: ${quoteId}`);
        return null;
      }

      const q = doc.data();
      const quotedPieces =
        q?.inventoryService?.inventoryQuantity ||
        q?.services?.[0]?.details?.inventoryQuantity ||
        0;
      const quotedRate =
        q?.inventoryService?.rate || q?.services?.[0]?.details?.rate || 0;
      const quoteNumber = q?.quoteNumber || null;

      return { quotedPieces, quotedRate, quoteNumber };
    } catch (error) {
      this.logger.error(`Error fetching quote metrics: ${error.message}`);
      return null;
    }
  }

  private aggregateMetrics(
    lotes: LoteDocument[],
    totalHoursWorked: number,
    attendanceRecords: AttendanceRecord[],
    quoteMetrics?: {
      quotedPieces: number;
      quotedRate: number;
      quoteNumber: string | null;
    } | null,
  ): DashboardResponse {
    const metrics: DashboardMetrics = {
      totalInspected: 0,
      approved: 0,
      rejected: 0,
      reworked: 0,
      totalDefects: 0,
    };

    const defectCounts = new Map<string, number>();
    const inspectorIds = new Set<string>();

    for (const lote of lotes) {
      const okCount = lote.okCount || 0;
      const rejectedCount = lote.rejectedCount || 0;
      const reworkOkCount = lote.reworkOkCount || 0;
      const reworkRejectedCount = lote.reworkRejectedCount || 0;

      const quantity =
        lote.quantity ||
        okCount + rejectedCount + reworkOkCount + reworkRejectedCount;

      metrics.totalInspected += quantity;
      metrics.approved += okCount;
      metrics.rejected += rejectedCount;
      metrics.reworked += reworkOkCount + reworkRejectedCount;

      const defectNames: string[] =
        lote.rejectedDefectNames && lote.rejectedDefectNames.length > 0
          ? lote.rejectedDefectNames
          : (lote.defectNames ?? []);

      if (defectNames.length > 0) {
        const qtyPerDefect = Math.ceil(rejectedCount / defectNames.length) || 1;

        for (const defect of defectNames) {
          metrics.totalDefects += qtyPerDefect;
          defectCounts.set(
            defect,
            (defectCounts.get(defect) || 0) + qtyPerDefect,
          );
        }
      }

      if (lote.inspectorId) {
        inspectorIds.add(lote.inspectorId);
      }
    }

    const topDefects: DefectAnalysis[] = Array.from(defectCounts.entries())
      .map(([defectName, count]) => ({ defectName, count }))
      .sort((a, b) => b.count - a.count);

    const quotedPieces = quoteMetrics?.quotedPieces;
    const quotedRate = quoteMetrics?.quotedRate;
    const quoteNumber = quoteMetrics?.quoteNumber ?? undefined;
    const remainingPieces =
      quotedPieces !== undefined
        ? quotedPieces - metrics.totalInspected
        : undefined;

    return {
      metrics,
      topDefects,
      activeInspectors: inspectorIds.size,
      totalHoursWorked,
      quotedPieces,
      remainingPieces,
      quotedRate,
      quoteNumber,
      attendanceRecords,
    };
  }
}
