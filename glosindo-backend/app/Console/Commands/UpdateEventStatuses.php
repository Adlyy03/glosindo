<?php

namespace App\Console\Commands;

use App\Models\Event;
use Illuminate\Console\Command;

class UpdateEventStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'events:update-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update all event statuses based on current date/time';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Updating event statuses...');

        $events = Event::whereNotIn('status', ['cancelled'])
                       ->get();

        $updated = 0;

        foreach ($events as $event) {
            $newStatus = Event::calculateStatus(
                $event->start_date ?: $event->event_date,
                $event->end_date ?: $event->start_date ?: $event->event_date,
                $event->start_time,
                $event->end_time
            );

            if ($event->status !== $newStatus) {
                $oldStatus = $event->status;
                $event->status = $newStatus;
                $event->save();

                $this->line("  Event '{$event->name}': {$oldStatus} → {$newStatus}");
                $updated++;
            }
        }

        $this->info("✓ Updated {$updated} event(s)");

        return 0;
    }
}
