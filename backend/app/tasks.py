def setup_scheduler(app):
    from app.models import process_daily_rewards
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.cron import CronTrigger
    import atexit
    
    scheduler = BackgroundScheduler()
    
    # Run rewards processing daily at midnight
    scheduler.add_job(
        process_daily_rewards,
        trigger=CronTrigger(hour=0, minute=0),
        id="process_daily_rewards",
        replace_existing=True
    )
    
    scheduler.start()
    
    # Shut down scheduler when app is closing
    atexit.register(lambda: scheduler.shutdown())