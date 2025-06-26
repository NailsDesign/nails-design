try {
  let lastSync = getLastSyncTime();

  for (const table of TABLES) {
    const latest = await syncTable(localClient, table, lastSync);
    if (latest && latest > lastSync) lastSync = latest;
    console.log(`[${table.name}] synced.`);
  }

  setLastSyncTime(lastSync);
  console.log(`[${new Date().toISOString()}] Sync complete.`);
} catch (err) {
  console.error('Global sync error:', err);
  await sendFailureEmail(
    'Sync Failure Alert',
    `An error occurred during sync:\n\n${err.stack || err.message}`
  );
}
