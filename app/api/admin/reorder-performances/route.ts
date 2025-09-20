import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, performances } = body;

    if (!eventId || !performances || !Array.isArray(performances)) {
      return NextResponse.json(
        { error: 'Event ID and performances array are required' },
        { status: 400 }
      );
    }

    // Validate that all performances have required fields
    for (const perf of performances) {
      if (!perf.id || typeof perf.itemNumber !== 'number') {
        return NextResponse.json(
          { error: 'Each performance must have id and itemNumber' },
          { status: 400 }
        );
      }
    }

    // Update item numbers for all performances
    let updateCount = 0;
    
    // We expect the incoming payload to include performance ids and new item numbers.
    // Update the performances table directly using the provided performance ids.
    for (const perf of performances) {
      try {
        // Validate itemNumber
        if (typeof perf.itemNumber !== 'number' || perf.itemNumber < 1) continue;

        // Update performance item number
        await db.updatePerformanceItemNumber(perf.id, perf.itemNumber);

        // Also try to sync the associated event entry's item number, if we can resolve it
        const performanceRecord = await db.getPerformanceById(perf.id);
        if (performanceRecord?.eventEntryId) {
          await db.updateEventEntry(performanceRecord.eventEntryId, { itemNumber: perf.itemNumber });
        }

        updateCount++;
      } catch (error) {
        console.error(`Error updating performance ${perf.id}:`, error);
        // Continue with other updates even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updateCount} performances`,
      updatedCount: updateCount
    });

  } catch (error) {
    console.error('Error reordering performances:', error);
    return NextResponse.json(
      { error: 'Failed to reorder performances' },
      { status: 500 }
    );
  }
}
