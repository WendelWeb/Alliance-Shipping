interface TransferSummary {
  trackingNumber: string;
  externalTrackingNumber: string | null;
  userName: string;
  userEmail: string;
  userCity: string;
  transferType: 'user_claimed' | 'admin_assigned';
  oldTotalCost: string;
  newTotalCost: string;
  delta: number;
  transferredAt: string;
}

interface DailyRecapData {
  date: string;
  transfers: TransferSummary[];
  stats: {
    total: number;
    userClaimed: number;
    adminAssigned: number;
    byCity: Record<string, number>;
    averageDelta: number;
    totalRevenue: number;
  };
  alerts: {
    unclaimedPackages: number;
    oldestUnclaimedDays: number;
  };
  trend: {
    yesterday: number;
    today: number;
    percentChange: number;
  };
}

export function generateDailyTransferRecapEmail(data: DailyRecapData): string {
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-HT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const transferTypeLabel = (type: 'user_claimed' | 'admin_assigned') => {
    return type === 'user_claimed' ? 'Réclamé' : 'Assigné';
  };

  const cityRows = Object.entries(data.stats.byCity)
    .map(([city, count]) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${city}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600;">${count}</td>
      </tr>
    `)
    .join('');

  const transferRows = data.transfers
    .map((transfer) => {
      const deltaColor = transfer.delta > 0 ? '#dc2626' : transfer.delta < 0 ? '#16a34a' : '#6b7280';
      const deltaSign = transfer.delta >= 0 ? '+' : '';

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <div style="font-weight: 600; color: #111827;">${transfer.trackingNumber}</div>
            ${transfer.externalTrackingNumber ? `<div style="font-size: 12px; color: #6b7280;">${transfer.externalTrackingNumber}</div>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <div style="font-weight: 500; color: #111827;">${transfer.userName}</div>
            <div style="font-size: 12px; color: #6b7280;">${transfer.userEmail}</div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background-color: ${transfer.transferType === 'user_claimed' ? '#dcfce7' : '#dbeafe'}; color: ${transfer.transferType === 'user_claimed' ? '#166534' : '#1e40af'};">
              ${transferTypeLabel(transfer.transferType)}
            </span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${transfer.userCity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(transfer.oldTotalCost)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(transfer.newTotalCost)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: ${deltaColor};">
            ${deltaSign}${formatCurrency(transfer.delta)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
            ${formatDate(transfer.transferredAt)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Récapitulatif quotidien des transferts - ${data.date}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 800px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">📊 Récapitulatif des Transferts</h1>
      <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">${data.date}</p>
    </div>

    <!-- Stats Cards -->
    <div style="background-color: white; padding: 30px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">

      <!-- Total Transfers -->
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 24px; border-radius: 12px; text-align: center; color: white;">
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Total Transferts</div>
        <div style="font-size: 36px; font-weight: 700;">${data.stats.total}</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">
          ${data.trend.percentChange > 0 ? '↑' : data.trend.percentChange < 0 ? '↓' : '='}
          ${Math.abs(data.trend.percentChange).toFixed(1)}% vs hier
        </div>
      </div>

      <!-- User Claimed -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; border-radius: 12px; text-align: center; color: white;">
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Réclamés</div>
        <div style="font-size: 36px; font-weight: 700;">${data.stats.userClaimed}</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">
          ${data.stats.total > 0 ? ((data.stats.userClaimed / data.stats.total) * 100).toFixed(0) : 0}%
        </div>
      </div>

      <!-- Admin Assigned -->
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 24px; border-radius: 12px; text-align: center; color: white;">
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Assignés</div>
        <div style="font-size: 36px; font-weight: 700;">${data.stats.adminAssigned}</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">
          ${data.stats.total > 0 ? ((data.stats.adminAssigned / data.stats.total) * 100).toFixed(0) : 0}%
        </div>
      </div>

      <!-- Average Delta -->
      <div style="background: linear-gradient(135deg, ${data.stats.averageDelta > 0 ? '#ef4444' : '#10b981'} 0%, ${data.stats.averageDelta > 0 ? '#dc2626' : '#059669'} 100%); padding: 24px; border-radius: 12px; text-align: center; color: white;">
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Delta Moyen</div>
        <div style="font-size: 36px; font-weight: 700;">
          ${data.stats.averageDelta >= 0 ? '+' : ''}${formatCurrency(data.stats.averageDelta)}
        </div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">par transfert</div>
      </div>
    </div>

    <!-- By City -->
    ${Object.keys(data.stats.byCity).length > 0 ? `
    <div style="background-color: white; padding: 30px; border-top: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;">📍 Par Ville</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Ville</th>
            <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Transferts</th>
          </tr>
        </thead>
        <tbody>
          ${cityRows}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Alerts -->
    ${data.alerts.unclaimedPackages > 0 ? `
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-top: 20px; border-radius: 8px;">
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="font-size: 24px;">⚠️</div>
        <div>
          <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">Alertes</div>
          <div style="color: #78350f; font-size: 14px;">
            ${data.alerts.unclaimedPackages} colis non réclamé${data.alerts.unclaimedPackages > 1 ? 's' : ''} dans le compte Alliance Shipping.
            ${data.alerts.oldestUnclaimedDays > 0 ? `Le plus ancien: ${data.alerts.oldestUnclaimedDays} jour${data.alerts.oldestUnclaimedDays > 1 ? 's' : ''}.` : ''}
          </div>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Transfer List -->
    ${data.transfers.length > 0 ? `
    <div style="background-color: white; padding: 30px; margin-top: 20px;">
      <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;">📋 Liste Complète (${data.transfers.length})</h2>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Colis</th>
              <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Utilisateur</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Type</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Ville</th>
              <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Ancien Prix</th>
              <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Nouveau Prix</th>
              <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Delta</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Heure</th>
            </tr>
          </thead>
          <tbody>
            ${transferRows}
          </tbody>
        </table>
      </div>
    </div>
    ` : `
    <div style="background-color: white; padding: 40px; margin-top: 20px; text-align: center; color: #6b7280;">
      <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
      <div style="font-size: 16px; font-weight: 500;">Aucun transfert aujourd'hui</div>
    </div>
    `}

    <!-- Footer -->
    <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 0 0 16px 16px; text-align: center; border-top: 1px solid #e5e7eb;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/transfers"
         style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Voir tous les transferts →
      </a>
      <div style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
        🤖 Généré automatiquement par <strong>Alliance Shipping Admin</strong>
      </div>
    </div>

  </div>
</body>
</html>
  `.trim();
}
