import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Plus, Clock, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Record {
  id: string;
  date: string;
  tech: string;
  jobId: string;
  gasType: string;
  weight: number;
  status: "Verified" | "Pending" | "Flagged";
}

const mockRecords: Record[] = [
  { id: "1", date: "2024-12-15", tech: "J. Martinez", jobId: "WO-2024-1847", gasType: "R-410A", weight: 12.5, status: "Verified" },
  { id: "2", date: "2024-12-14", tech: "S. Williams", jobId: "WO-2024-1846", gasType: "R-22", weight: 8.0, status: "Verified" },
  { id: "3", date: "2024-12-14", tech: "J. Martinez", jobId: "WO-2024-1845", gasType: "R-134A", weight: 4.2, status: "Pending" },
  { id: "4", date: "2024-12-13", tech: "M. Johnson", jobId: "WO-2024-1844", gasType: "R-410A", weight: 15.0, status: "Verified" },
  { id: "5", date: "2024-12-12", tech: "S. Williams", jobId: "WO-2024-1843", gasType: "R-407C", weight: 6.8, status: "Flagged" },
];

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<Record[]>(mockRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    tech: "",
    jobId: "",
    gasType: "",
    weight: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("2026-01-01T00:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "You have been securely logged out.",
    });
    navigate("/");
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const record: Record = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      tech: newRecord.tech,
      jobId: newRecord.jobId,
      gasType: newRecord.gasType,
      weight: Number(newRecord.weight),
      status: "Pending",
    };
    setRecords([record, ...records]);
    setNewRecord({ tech: "", jobId: "", gasType: "", weight: "" });
    setIsDialogOpen(false);
    toast({
      title: "Record Added",
      description: "New compliance record has been saved.",
    });
  };

  const getStatusBadge = (status: Record["status"]) => {
    const styles = {
      Verified: "bg-accent/20 text-accent",
      Pending: "bg-status-yellow/20 text-status-yellow",
      Flagged: "bg-destructive/20 text-destructive",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">
              True608 Intelligence
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-border"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Countdown Banner */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Enforcement Deadline:</span>
            </div>
            <div className="flex items-center gap-4 font-medium text-foreground tabular-nums">
              <span>{timeLeft.days}d</span>
              <span>{timeLeft.hours}h</span>
              <span>{timeLeft.minutes}m</span>
              <span>{timeLeft.seconds}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-semibold text-foreground">{records.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-semibold text-foreground">
                  {records.filter(r => r.status === "Verified").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-semibold text-foreground">
                  {records.filter(r => r.status === "Flagged" || r.status === "Pending").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Compliance Records</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Record
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add New Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddRecord} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Technician</label>
                    <Input
                      value={newRecord.tech}
                      onChange={(e) => setNewRecord({ ...newRecord, tech: e.target.value })}
                      placeholder="Technician name"
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Job ID</label>
                    <Input
                      value={newRecord.jobId}
                      onChange={(e) => setNewRecord({ ...newRecord, jobId: e.target.value })}
                      placeholder="WO-2024-XXXX"
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Gas Type</label>
                    <Select
                      value={newRecord.gasType}
                      onValueChange={(value) => setNewRecord({ ...newRecord, gasType: value })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Select refrigerant" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="R-410A">R-410A</SelectItem>
                        <SelectItem value="R-22">R-22</SelectItem>
                        <SelectItem value="R-134A">R-134A</SelectItem>
                        <SelectItem value="R-407C">R-407C</SelectItem>
                        <SelectItem value="R-32">R-32</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Weight (lbs)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newRecord.weight}
                      onChange={(e) => setNewRecord({ ...newRecord, weight: e.target.value })}
                      placeholder="0.0"
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    Save Record
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Tech</TableHead>
                <TableHead className="text-muted-foreground">Job ID</TableHead>
                <TableHead className="text-muted-foreground">Gas Type</TableHead>
                <TableHead className="text-muted-foreground text-right">Weight (lbs)</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} className="border-border">
                  <TableCell className="text-foreground">{record.date}</TableCell>
                  <TableCell className="text-foreground">{record.tech}</TableCell>
                  <TableCell className="text-foreground font-mono text-sm">{record.jobId}</TableCell>
                  <TableCell className="text-foreground">{record.gasType}</TableCell>
                  <TableCell className="text-foreground text-right tabular-nums">{record.weight.toFixed(1)}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
