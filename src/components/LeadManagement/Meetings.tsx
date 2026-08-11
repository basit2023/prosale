'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PiCalendarCheck, PiMapPin, PiPlusBold, PiSpinnerGap, PiUsersThree, PiWarningCircle } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Text, Title } from '@/components/ui/text';
import apiService from '@/utils/apiService';

type MeetingAttachment = {
  name?: string | null;
  url?: string | null;
  mime_type?: string | null;
  size?: number | null;
  dataUrl?: string | null;
};

type PendingAttachment = {
  name: string;
  dataUrl: string;
  mime_type: string;
  size: number;
};

type Meeting = {
  id: number;
  lead_id?: number | null;
  client_name?: string | null;
  assigned_agent?: string | null;
  meeting_type?: string | null;
  meeting_at?: string | null;
  duration_minutes?: number | null;
  property_project?: string | null;
  notes?: string | null;
  client_feedback?: string | null;
  meeting_outcome?: string | null;
  follow_up_action?: string | null;
  next_meeting_at?: string | null;
  status_label_id?: number | null;
  status_label?: string | null;
  attachments?: MeetingAttachment[] | string | null;
};

type LeadOption = {
  lead_id: number;
  customer_id?: number | null;
  customer_name?: string | null;
  client_name?: string | null;
  mobile?: string | null;
  client_mobile?: string | null;
  email?: string | null;
  client_email?: string | null;
  city?: string | null;
  project_name?: string | null;
  source_name?: string | null;
  assigned_to?: string | null;
  label?: string | null;
  status_label_name?: string | null;
  investment_budget?: string | null;
};

const defaultForm = {
  lead_id: '',
  client_name: '',
  meeting_type: 'office_meeting',
  meeting_at: '',
  duration_minutes: '30',
  property_project: '',
  notes: '',
  client_feedback: '',
  meeting_outcome: '',
  follow_up_action: '',
  next_meeting_at: '',
  next_meeting_date: '',
  next_meeting_time: '',
};

const meetingTypes = [
  { value: 'call', label: 'Call' },
  { value: 'office_meeting', label: 'Office Meeting' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'online_meeting', label: 'Online Meeting' },
];

function formatDateTime(value?: string | null) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function leadName(lead: LeadOption) {
  return lead.customer_name || lead.client_name || `Lead #${lead.lead_id}`;
}

function leadMobile(lead: LeadOption) {
  return lead.mobile || lead.client_mobile || '';
}

function leadEmail(lead: LeadOption) {
  return lead.email || lead.client_email || '';
}

function apiAssetUrl(url?: string | null) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = String((apiService as any)?.defaults?.baseURL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getMeetingAttachments(value?: Meeting['attachments']) {
  if (!value) return [] as MeetingAttachment[];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Unable to read image'));
    reader.readAsDataURL(file);
  });
}
export default function Meetings() {
  const { data: session } = useSession();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [leadQuery, setLeadQuery] = useState('');
  const [leadResults, setLeadResults] = useState<LeadOption[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadOption | null>(null);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [isLeadDropdownOpen, setIsLeadDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const summary = useMemo(() => ({
    total: meetings.length,
    siteVisits: meetings.filter((item) => item.meeting_type === 'site_visit').length,
    calls: meetings.filter((item) => item.meeting_type === 'call').length,
    nextActions: meetings.filter((item) => item.follow_up_action || item.next_meeting_at).length,
  }), [meetings]);

  const updateForm = (key: keyof typeof defaultForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const loadMeetings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.get('/meetings');
      const rows = Array.isArray(response.data?.data)
        ? response.data.data
        : response.data?.data?.meetings || response.data?.meetings || [];
      setMeetings(rows);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load meetings.');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLeadOptions = async (query = '') => {
    setSearching(true);
    setError('');
    try {
      const params = new URLSearchParams({ mine: '1', limit: '50' });
      if (query.trim()) params.set('q', query.trim());
      const response = await apiService.get(`/meetings/search-leads?${params.toString()}`);
      const rows = Array.isArray(response.data?.data)
        ? response.data.data
        : response.data?.data?.leads || response.data?.leads || [];
      setLeadResults(rows);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load assigned clients.');
      setLeadResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    loadMeetings();
    loadLeadOptions();
  }, []);

  useEffect(() => {
    if (!isLeadDropdownOpen) return;
    const timer = window.setTimeout(() => {
      loadLeadOptions(leadQuery);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [leadQuery, isLeadDropdownOpen]);

  const searchLeads = async () => {
    setIsLeadDropdownOpen(true);
    await loadLeadOptions(leadQuery);
  };

  const selectLead = (lead: LeadOption) => {
    const name = leadName(lead);
    const mobile = leadMobile(lead);
    updateForm('lead_id', String(lead.lead_id));
    updateForm('client_name', name);
    updateForm('property_project', lead.project_name || '');
    setSelectedLead(lead);
    setLeadQuery(`${name}${mobile ? ` (${mobile})` : ''}`);
    setIsLeadDropdownOpen(false);
  };

  
  const handleAttachmentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, 5);
    if (!files.length) return;

    try {
      const nextAttachments = await Promise.all(files.map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed for meeting photos.');
        }
        if (file.size > 3 * 1024 * 1024) {
          throw new Error('Each meeting photo must be 3MB or smaller.');
        }

        return {
          name: file.name,
          dataUrl: await readFileAsDataUrl(file),
          mime_type: file.type,
          size: file.size,
        };
      }));

      setAttachments((current) => [...current, ...nextAttachments].slice(0, 5));
    } catch (err: any) {
      setError(err?.message || 'Unable to attach meeting photo.');
    } finally {
      event.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };
const saveMeeting = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.client_name.trim() || !form.meeting_at) {
      setError('Client/lead name and meeting date/time are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await apiService.post('/meetings', {
        ...form,
        lead_id: form.lead_id ? Number(form.lead_id) : null,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        assigned_agent: (session as any)?.user?.username || (session as any)?.user?.name || null,
        next_meeting_at: null,
        next_meeting_date: form.next_meeting_date || null,
        next_meeting_time: form.next_meeting_time || null,
      });
      setForm(defaultForm);
      setLeadQuery('');
      setSelectedLead(null);
      await loadLeadOptions();
      await loadMeetings();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to save meeting.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<PiCalendarCheck />} label="Total meetings" value={summary.total} />
        <SummaryCard icon={<PiMapPin />} label="Site visits" value={summary.siteVisits} />
        <SummaryCard icon={<PiUsersThree />} label="Calls" value={summary.calls} />
        <SummaryCard icon={<PiWarningCircle />} label="Next actions" value={summary.nextActions} />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={saveMeeting} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Title as="h3" className="text-lg font-bold">Add attended meeting</Title>
              <Text className="text-sm text-gray-500">Pick from your assigned clients or search by name, mobile, project, or category.</Text>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Text className="mb-1 text-xs font-medium text-gray-500">Assigned client/lead</Text>
              <div className="relative">
                <div className="flex gap-2">
                  <Input
                    value={leadQuery}
                    onFocus={() => setIsLeadDropdownOpen(true)}
                    onChange={(event) => {
                      setLeadQuery(event.target.value);
                      setIsLeadDropdownOpen(true);
                    }}
                    placeholder="Select or search your assigned clients..."
                  />
                  <Button type="button" onClick={searchLeads} disabled={searching}>{searching ? '...' : 'Search'}</Button>
                </div>
                {isLeadDropdownOpen ? (
                  <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-auto rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
                    {searching ? (
                      <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                        <PiSpinnerGap className="mr-2 animate-spin" /> Loading assigned clients...
                      </div>
                    ) : leadResults.length ? (
                      leadResults.map((lead) => {
                        const name = leadName(lead);
                        const mobile = leadMobile(lead);
                        const email = leadEmail(lead);
                        return (
                          <button key={lead.lead_id} type="button" onClick={() => selectLead(lead)} className="mb-1 w-full rounded-md border border-gray-100 bg-gray-50 p-3 text-left text-sm transition hover:border-primary hover:bg-primary/5">
                            <span className="font-semibold text-gray-900">{name}</span>
                            <span className="mt-1 block text-xs text-gray-500">
                              Lead #{lead.lead_id} | {mobile || 'No mobile'} | {lead.project_name || 'No project'}
                            </span>
                            <span className="mt-1 block text-xs text-gray-400">
                              {lead.status_label_name || lead.label || 'No category'}{email ? ` | ${email}` : ''}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">No assigned clients found.</div>
                    )}
                  </div>
                ) : null}
              </div>
              {selectedLead ? (
                <div className="mt-3 rounded-lg border border-primary/20 bg-primary-lighter/40 p-3 text-xs text-gray-600">
                  <div className="font-semibold text-gray-900">Selected: {leadName(selectedLead)}</div>
                  <div className="mt-1 grid gap-1 sm:grid-cols-2">
                    <span>Lead ID: {selectedLead.lead_id}</span>
                    <span>Mobile: {leadMobile(selectedLead) || 'N/A'}</span>
                    <span>Project: {selectedLead.project_name || 'N/A'}</span>
                    <span>Category: {selectedLead.status_label_name || selectedLead.label || 'N/A'}</span>
                    <span>Source: {selectedLead.source_name || 'N/A'}</span>
                    <span>Budget: {selectedLead.investment_budget || 'N/A'}</span>
                  </div>
                </div>
              ) : null}
            </div>

            <Input label="Client or lead name" value={form.client_name} onChange={(event) => updateForm('client_name', event.target.value)} />
            <div>
              <Text className="mb-1 text-xs font-medium text-gray-500">Meeting type</Text>
              <select value={form.meeting_type} onChange={(event) => updateForm('meeting_type', event.target.value)} className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm">
                {meetingTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <Input label="Meeting date and time" type="datetime-local" value={form.meeting_at} onChange={(event) => updateForm('meeting_at', event.target.value)} />
            <Input label="Duration minutes" type="number" value={form.duration_minutes} onChange={(event) => updateForm('duration_minutes', event.target.value)} />
            <Input label="Property or project discussed" value={form.property_project} onChange={(event) => updateForm('property_project', event.target.value)} />
            <Textarea label="Notes" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} />
            <Textarea label="Client feedback" value={form.client_feedback} onChange={(event) => updateForm('client_feedback', event.target.value)} />
            <Input label="Meeting outcome" value={form.meeting_outcome} onChange={(event) => updateForm('meeting_outcome', event.target.value)} />
            <Input label="Follow-up action" value={form.follow_up_action} onChange={(event) => updateForm('follow_up_action', event.target.value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Next meeting date" type="date" value={form.next_meeting_date} onChange={(event) => updateForm('next_meeting_date', event.target.value)} />
              <Input label="Next meeting time" type="time" value={form.next_meeting_time} onChange={(event) => updateForm('next_meeting_time', event.target.value)} />
            </div>
            <div>
              <Text className="mb-1 text-xs font-medium text-gray-500">Meeting photos</Text>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleAttachmentChange}
                className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary-lighter file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary"
              />
              {attachments.length ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {attachments.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <img src={item.dataUrl} alt={item.name} className="h-20 w-full object-cover" />
                      <button type="button" onClick={() => removeAttachment(index)} className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-red-600 shadow">
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <Button type="submit" className="mt-5 w-full" disabled={saving}>
            {saving ? <PiSpinnerGap className="animate-spin" /> : <PiPlusBold />} Save meeting
          </Button>
        </form>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <Title as="h3" className="text-lg font-bold">Meeting list</Title>
              {/* <Text className="text-sm text-gray-500">Your allowed meetings based on user/team/admin permission.</Text> */}
            </div>
            <Button variant="outline" onClick={loadMeetings} disabled={loading}>Refresh</Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-10 text-gray-500"><PiSpinnerGap className="mr-2 animate-spin" /> Loading meetings...</div>
          ) : !meetings.length ? (
            <div className="p-10 text-center text-gray-500">No meetings found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Title as="h4" className="text-base font-bold">{meeting.client_name || `Meeting #${meeting.id}`}</Title>
                      <Text className="text-sm text-gray-500">{meeting.assigned_agent || 'Unassigned'} | {formatDateTime(meeting.meeting_at)} | {meeting.duration_minutes || 0} min</Text>
                    </div>
                    <span className="rounded-full border border-[#f3c2c8] bg-[#fff0f1] px-3 py-1 text-xs font-semibold text-[#b42335]">
                      {meetingTypes.find((item) => item.value === meeting.meeting_type)?.label || meeting.meeting_type || 'Meeting'}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                    <div><strong>Project:</strong> {meeting.property_project || 'N/A'}</div>
                    <div><strong>Outcome:</strong> {meeting.meeting_outcome || 'N/A'}</div>
                    <div><strong>Next action:</strong> {meeting.follow_up_action || 'N/A'}</div>
                    <div><strong>Next meeting:</strong> {formatDateTime(meeting.next_meeting_at)}</div>
                  </div>
                  {meeting.notes ? <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{meeting.notes}</div> : null}
                  <MeetingAttachmentPreview attachments={meeting.attachments} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#fff0f1] text-xl text-[#c94b5a]">
        <span className="inline-flex text-2xl leading-none text-[#c94b5a] [&>svg]:h-6 [&>svg]:w-6 [&>svg]:text-[#c94b5a]">
          {icon}
        </span>
      </div>
      <div className="text-3xl font-black text-gray-900">{value}</div>
      <Text className="text-sm font-medium text-gray-500">{label}</Text>
    </div>
  );
}
function MeetingAttachmentPreview({ attachments }: { attachments?: Meeting['attachments'] }) {
  const images = getMeetingAttachments(attachments).filter((item) => item?.url || item?.dataUrl);
  if (!images.length) return null;

  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {images.map((item, index) => {
        const src = item.dataUrl || apiAssetUrl(item.url);
        return (
          <a key={`${src}-${index}`} href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <img src={src} alt={item.name || 'Meeting attachment'} className="h-24 w-full object-cover transition hover:scale-105" />
          </a>
        );
      })}
    </div>
  );
}

