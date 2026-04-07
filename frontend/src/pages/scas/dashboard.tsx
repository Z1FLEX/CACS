import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Cell,
} from 'recharts'
import { getUsers, getAccessCards, getAccessLogs, getDevices, getZones } from '@/services'

export default function SCASDashboard() {
  const users = getUsers()
  const cards = getAccessCards()
  const accessLogs = getAccessLogs()
  const devices = getDevices()
  const zones = getZones()
  const totalUsers = users.length
  const activeCards = cards.filter((c) => c.status === 'ACTIVE').length
  const onlineDevices = devices.filter((d) => d.status === 'online').length
  const offlineDevices = devices.filter((d) => d.status === 'offline').length
  const todayAccessAttempts = accessLogs.length
  const successfulAccess = accessLogs.filter((log) => log.status === 'success').length
  const deniedAccess = accessLogs.filter((log) => log.status === 'denied').length

  // Chart data: Access Attempts Over Time (mock hourly data)
  const accessAttemptsData = [
    { hour: '06:00', attempts: 5 },
    { hour: '07:00', attempts: 12 },
    { hour: '08:00', attempts: 45 },
    { hour: '09:00', attempts: 52 },
    { hour: '10:00', attempts: 48 },
    { hour: '11:00', attempts: 38 },
    { hour: '12:00', attempts: 25 },
    { hour: '13:00', attempts: 18 },
    { hour: '14:00', attempts: 42 },
    { hour: '15:00', attempts: 55 },
    { hour: '16:00', attempts: 49 },
    { hour: '17:00', attempts: 35 },
  ]

  // Chart data: Authorized vs Refused (by hour)
  const accessComparisonData = [
    { hour: '06:00', authorized: 5, refused: 0 },
    { hour: '07:00', authorized: 11, refused: 1 },
    { hour: '08:00', authorized: 43, refused: 2 },
    { hour: '09:00', authorized: 50, refused: 2 },
    { hour: '10:00', authorized: 46, refused: 2 },
    { hour: '11:00', authorized: 36, refused: 2 },
    { hour: '12:00', authorized: 24, refused: 1 },
    { hour: '13:00', authorized: 17, refused: 1 },
    { hour: '14:00', authorized: 40, refused: 2 },
    { hour: '15:00', authorized: 53, refused: 2 },
    { hour: '16:00', authorized: 47, refused: 2 },
    { hour: '17:00', authorized: 33, refused: 2 },
  ]

  // Chart data: Device Status
  const deviceStatusData = [
    {
      status: 'Online',
      value: onlineDevices,
      fill: '#22c55e',
    },
    {
      status: 'Offline',
      value: offlineDevices,
      fill: '#ef4444',
    },
  ]

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>SCAS Dashboard</h2>
        <p className='text-muted-foreground'>Centralized Access Control System Overview</p>
      </div>

      {/* Key Statistics Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{totalUsers}</div>
            <p className='text-xs text-muted-foreground'>Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-green-600'>{activeCards}</div>
            <p className='text-xs text-muted-foreground'>Out of {cards.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Devices Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-green-600'>{onlineDevices}</div>
            <p className='text-xs text-muted-foreground'>{offlineDevices} offline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Zones Managed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{zones.length}</div>
            <p className='text-xs text-muted-foreground'>Active access zones</p>
          </CardContent>
        </Card>
      </div>

      {/* Access Activity */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Total Access Attempts (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{todayAccessAttempts}</div>
            <p className='text-xs text-muted-foreground'>Access log entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Successful Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-green-600'>{successfulAccess}</div>
            <p className='text-xs text-muted-foreground'>{((successfulAccess / todayAccessAttempts) * 100).toFixed(1)}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-red-600'>{deniedAccess}</div>
            <p className='text-xs text-muted-foreground'>Failed attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Access Log Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Access Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {accessLogs.slice(0, 5).map((log) => (
              <div key={log.id} className='flex items-center justify-between border-b pb-3 last:border-0'>
                <div>
                  <p className='font-medium text-sm'>{log.userName} - {log.doorName}</p>
                  <p className='text-xs text-muted-foreground'>{log.timestamp}</p>
                </div>
                <div className='flex items-center gap-3'>
                  <Badge variant={log.action === 'ENTRY' ? 'secondary' : 'default'}>
                    {log.action}
                  </Badge>
                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                    {log.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Access Attempts Over Time - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Access Attempts Over Time</CardTitle>
            <CardDescription>Hourly access attempts throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                attempts: {
                  label: 'Access Attempts',
                  color: '#3b82f6',
                },
              }}
              className='h-[300px] w-full'
            >
              <LineChart data={accessAttemptsData}>
                <CartesianGrid strokeDasharray='4 4' vertical={false} />
                <XAxis
                  dataKey='hour'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <Line
                  dataKey='attempts'
                  type='natural'
                  fill='#3b82f6'
                  stroke='#3b82f6'
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    fill: '#3b82f6',
                    stroke: '#3b82f6',
                    r: 4,
                  }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator='line' />}
                  cursor={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Authorized vs Refused - Stacked Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Authorized vs Refused Access</CardTitle>
            <CardDescription>Successful vs denied access attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                authorized: {
                  label: 'Authorized',
                  color: '#22c55e',
                },
                refused: {
                  label: 'Refused',
                  color: '#ef4444',
                },
              }}
              className='h-[300px] w-full'
            >
              <BarChart data={accessComparisonData}>
                <CartesianGrid strokeDasharray='4 4' vertical={false} />
                <XAxis
                  dataKey='hour'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <Bar
                  dataKey='authorized'
                  stackId='a'
                  fill='#22c55e'
                  radius={4}
                />
                <Bar
                  dataKey='refused'
                  stackId='a'
                  fill='#ef4444'
                  radius={4}
                />
                <Legend />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Device Status - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Device Status Summary</CardTitle>
            <CardDescription>Online and offline devices</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: 'Devices',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className='h-[300px] w-full'
            >
              <BarChart
                data={deviceStatusData}
                layout='vertical'
              >
                <CartesianGrid strokeDasharray='4 4' horizontal={false} />
                <XAxis type='number' />
                <YAxis dataKey='status' type='category' tickLine={false} />
                <Bar dataKey='value' fill='var(--color-value)' radius={4}>
                  {deviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Access Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Access Statistics</CardTitle>
            <CardDescription>Summary of access control events</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>Total Attempts</p>
                <p className='text-2xl font-bold'>{todayAccessAttempts}</p>
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>Success Rate</p>
                <p className='text-2xl font-bold text-green-600'>
                  {((successfulAccess / todayAccessAttempts) * 100).toFixed(1)}%
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>Authorized</p>
                <p className='text-2xl font-bold text-green-600'>{successfulAccess}</p>
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>Denied</p>
                <p className='text-2xl font-bold text-red-600'>{deniedAccess}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Overall Status</span>
            <Badge className='bg-green-600'>Operational</Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Database Connection</span>
            <Badge className='bg-green-600'>Connected</Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>API Availability</span>
            <Badge className='bg-green-600'>Available</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
