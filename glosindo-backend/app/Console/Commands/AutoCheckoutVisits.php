<?php

namespace App\Console\Commands;

use App\Models\Visit;
use Illuminate\Console\Command;

class AutoCheckoutVisits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'visits:auto-checkout {--minutes=10 : Idle timeout in minutes before automatic checkout}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically check out regular visits that have not scanned checkout within the configured timeout';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $minutes = max(1, (int) $this->option('minutes'));
        $checkedOutCount = Visit::autoCheckoutExpired($minutes);

        $this->info("Auto-checked out {$checkedOutCount} expired visit(s) (> {$minutes} minute(s) without checkout scan).");

        return 0;
    }
}

