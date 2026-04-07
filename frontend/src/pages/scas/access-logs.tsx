import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TableDataWrapper, ColumnConfig } from '@/components/custom/table-data-wrapper'
import { EmptyState } from '@/components/custom/empty-state'
import type { AccessLog } from '@/types/scas'
import { getAccessLogs } from '@/services'

const accessLogColumns: ColumnConfig[] = [
  { key: 'timestamp', label: 'Timestamp', visible: true },
  { key: 'userName', label: 'User', visible: true },
  { key: 'cardId', label: 'Card ID', visible: true },
  { key: 'action', label: 'Action', visible: true },
  { key: 'doorName', label: 'Door', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'reason', label: 'Reason', visible: true },
]

export default function AccessLogsPage() {
  const [logs] = useState<AccessLog[]>(() => getAccessLogs())

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Access Logs</h2>
        <p className='text-muted-foreground'>View all access attempts and door activity (Read-only)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <EmptyState
              title="No access logs yet"
              description="Access attempts and door events will appear here. Logs are read-only."
            />
          ) : (
          <TableDataWrapper
            data={logs}
            columns={accessLogColumns}
            itemsPerPage={10}
            searchableFields={['userName', 'cardId', 'doorName', 'action']}
          >
            {({ data, visibleColumns }) => (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.map(col => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((log) => (
                      <TableRow key={log.id}>
                        {visibleColumns.map(col => (
                          <TableCell key={`${log.id}-${col.key}`} className={col.key === 'timestamp' ? 'text-sm' : ''}>
                            {col.key === 'action' && (
                              <Badge variant={log.action === 'ENTRY' ? 'secondary' : 'default'}>
                                {log.action}
                              </Badge>
                            )}
                            {col.key === 'status' && (
                              <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                {log.status}
                              </Badge>
                            )}
                            {col.key === 'userName' && <span className='font-medium'>{log.userName}</span>}
                            {col.key === 'reason' && (log.reason || '-')}
                            {!['action', 'status', 'userName', 'reason'].includes(col.key) && (
                              <>
                                {col.key === 'timestamp' && log.timestamp}
                                {col.key === 'cardId' && log.cardId}
                                {col.key === 'doorName' && log.doorName}
                              </>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TableDataWrapper>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
