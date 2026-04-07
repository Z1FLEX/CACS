import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TableDataWrapper, ColumnConfig } from '@/components/custom/table-data-wrapper'
import type { AuditLog } from '@/types/scas'
import { getAuditLogs } from '@/services'

const auditLogColumns: ColumnConfig[] = [
  { key: 'timestamp', label: 'Timestamp', visible: true },
  { key: 'admin', label: 'Administrator', visible: true },
  { key: 'action', label: 'Action', visible: true },
  { key: 'entity', label: 'Entity', visible: true },
  { key: 'entityId', label: 'Entity ID', visible: true },
  { key: 'changes', label: 'Changes', visible: true },
]

export default function AuditLogsPage() {
  const [logs] = useState<AuditLog[]>(() => getAuditLogs())

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Admin Audit Logs</h2>
        <p className='text-muted-foreground'>Track all administrative actions (Admin only - Read-only)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <TableDataWrapper
            data={logs}
            columns={auditLogColumns}
            itemsPerPage={10}
            searchableFields={['admin', 'action', 'entity', 'changes']}
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
                              <Badge variant='secondary'>{log.action}</Badge>
                            )}
                            {col.key === 'admin' && <span className='font-medium'>{log.admin}</span>}
                            {col.key === 'entityId' && <span className='font-mono text-xs'>{log.entityId}</span>}
                            {!['action', 'admin', 'entityId'].includes(col.key) && (
                              <>
                                {col.key === 'timestamp' && log.timestamp}
                                {col.key === 'entity' && log.entity}
                                {col.key === 'changes' && log.changes}
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
        </CardContent>
      </Card>
    </div>
  )
}
