import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Shield, 
  AlertTriangle, 
  Truck, 
  Thermometer,
  Calendar,
  MapPin,
  User,
  ChevronRight,
  BarChart3,
  Clock,
  Wrench,
  LogOut
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ComplianceLog {
  id: string;
  cylinder_id: string;
  tech_id: string;
  start_weight_lbs: number;
  end_weight_lbs: number;
  delta_lbs: number;
  photo_url: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  logged_at: string;
  synced: boolean;
  tech_name?: string;
}

interface Asset {
  id: string;
  name: string;
  location: string | null;
  asset_type: string | null;
  created_at: string;
}

interface ControlTowerProps {
  onBack?: () => void;
  onEnterFieldMode?: () => void;
}

const ControlTower = ({ onBack, onEnterFieldMode }: ControlTowerProps) => {
  const { user, role, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"fleet" | "logs">("fleet");
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<ComplianceLog[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is super_admin (bypasses company_id restrictions)
  const isSuperAdmin = role?.toLowerCase() === 'super_admin' || role?.toLowerCase() === 'superadmin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch compliance logs
    const { data: logsData, error: logsError } = await (supabase as any)
      .from('compliance_logs')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(50);

    if (!logsError && logsData) {
      setLogs(logsData as ComplianceLog[]);
    }

    // Fetch assets
    const { data: assetsData, error: assetsError } = await (supabase as any)
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!assetsError && assetsData) {
      setAssets(assetsData as Asset[]);
    }

    setIsLoading(false);
  };

  const getLogStatus = (log: ComplianceLog): "audit-ready" | "risk" => {
    const hasPhoto = !!log.photo_url;
    const hasGPS = log.gps_latitude !== null && log.gps_longitude !== null;
    const delta = log.delta_lbs || (log.start_weight_lbs - log.end_weight_lbs);
    const leakRate = (delta / log.start_weight_lbs) * 100;
    
    if (hasPhoto && hasGPS && leakRate <= 20) {
      return "audit-ready";
    }
    return "risk";
  };

  const auditReadyCount = logs.filter(l => getLogStatus(l) === "audit-ready").length;
  const riskCount = logs.filter(l => getLogStatus(l) === "risk").length;
  const totalCharged = logs.reduce((sum, l) => sum + (l.delta_lbs || (l.start_weight_lbs - l.end_weight_lbs)), 0);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch comprehensive data with joins
      const { data: logsData, error: logsError } = await (supabase as any)
        .from('compliance_logs')
        .select(`
          *,
          cylinders (
            qr_code_id,
            refrigerant_type,
            asset_id,
            assets (
              name,
              location
            )
          ),
          profiles:tech_id (
            full_name,
            email,
            company_id,
            epa_cert_number
          )
        `)
        .order('logged_at', { ascending: false });

      if (logsError) {
        console.error('Error fetching logs:', logsError);
        throw logsError;
      }

      // Fetch company data if available
      // SUPER ADMIN: Bypass company_id restrictions - can see all companies
      let companyData: { id: string; name: string; logo_url?: string } | null = null;
      if (user) {
        try {
          const { data: userProfile } = await (supabase as any)
            .from('profiles')
            .select('company_id, full_name')
            .eq('id', user.id)
            .single();

          // SUPER ADMIN: Use "True608 Intelligence" as company name (oversees all)
          if (isSuperAdmin) {
            companyData = {
              id: 'super_admin',
              name: 'True608 Intelligence',
              logo_url: undefined
            };
          } else if (userProfile?.company_id) {
            // Try to fetch company details (companies table may or may not exist)
            try {
              const { data: company } = await (supabase as any)
                .from('companies')
                .select('*')
                .eq('id', userProfile.company_id)
                .single();
              
              if (company) {
                companyData = {
                  id: company.id,
                  name: company.name || userProfile.full_name || 'Company',
                  logo_url: company.logo_url
                };
              }
            } catch (companyError) {
              // Companies table doesn't exist or error - use profile name
              companyData = {
                id: user.id,
                name: userProfile.full_name || user.email?.split('@')[0] || 'Company',
                logo_url: undefined
              };
            }
          } else {
            // No company_id, use profile name
            companyData = {
              id: user.id,
              name: userProfile?.full_name || user.email?.split('@')[0] || 'Company',
              logo_url: undefined
            };
          }
        } catch (profileError) {
          // Fallback to user email
          companyData = {
            id: user.id,
            name: user.email?.split('@')[0] || 'Company',
            logo_url: undefined
          };
        }
      }

      // Transform data for PDF
      const pdfLogs = (logsData || []).map((log: any) => ({
        id: log.id,
        logged_at: log.logged_at,
        tech_id: log.tech_id,
        tech_name: log.profiles?.full_name || log.profiles?.email || 'Unknown',
        tech_epa_cert: log.profiles?.epa_cert_number || 'N/A',
        cylinder_id: log.cylinder_id,
        cylinder_serial: log.cylinders?.qr_code_id,
        asset_id: log.cylinders?.asset_id,
        asset_serial: log.cylinders?.assets?.name,
        gas_type: log.cylinders?.refrigerant_type,
        start_weight_lbs: log.start_weight_lbs,
        start_weight_oz: log.start_weight_oz || 0,
        end_weight_lbs: log.end_weight_lbs,
        end_weight_oz: log.end_weight_oz || 0,
        delta_lbs: log.delta_lbs || (log.start_weight_lbs - log.end_weight_lbs),
        gps_latitude: log.gps_latitude,
        gps_longitude: log.gps_longitude,
        location_gps: log.gps_latitude && log.gps_longitude 
          ? `${log.gps_latitude.toFixed(4)}, ${log.gps_longitude.toFixed(4)}`
          : null
      }));

      // Calculate summary
      const totalRecovered = pdfLogs
        .filter((l: any) => l.delta_lbs < 0)
        .reduce((sum: number, l: any) => sum + Math.abs(l.delta_lbs), 0);
      
      const totalCharged = pdfLogs
        .filter((l: any) => l.delta_lbs > 0)
        .reduce((sum: number, l: any) => sum + l.delta_lbs, 0);

      const summary = {
        totalRecovered,
        totalCharged,
        totalLogs: pdfLogs.length
      };

      // Generate PDF
      const { generateComplianceBinderPDF } = await import('@/utils/pdfGenerator');
      const pdfBlob = await generateComplianceBinderPDF(pdfLogs, companyData, summary);

      // Download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `True608_Federal_Compliance_Binder_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "EPA Audit Binder Generated",
        description: "Download ready with federal citations and company branding",
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: error.message || "Please ensure jspdf and jspdf-autotable are installed",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been logged out",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-3 py-2 bg-card border border-border rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:border-[#F97316]/50 transition-colors font-sans"
                >
                  ← Back
                </button>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-wide font-sans">
                  <span className="text-white">True608</span> <span className="text-[#F97316]">CONTROL TOWER</span>
                </h1>
                <p className="text-sm text-zinc-400 font-light">Federal Compliance Vault</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(role === 'owner' || role === 'admin') && onEnterFieldMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEnterFieldMode}
                  className="hidden md:flex"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  ENTER FIELD MODE
                </Button>
              )}
              <button
                onClick={handleSignOut}
                className="px-3 py-2 bg-card border border-border rounded text-sm font-medium text-muted-foreground hover:bg-[#F97316] hover:text-black hover:border-[#F97316] transition-colors font-sans flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="card-industrial p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-success/20">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{auditReadyCount}</p>
                <p className="text-xs text-muted-foreground">AUDIT-READY</p>
              </div>
            </div>
          </div>

          <div className="card-industrial p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{riskCount}</p>
                <p className="text-xs text-muted-foreground">AT RISK</p>
              </div>
            </div>
          </div>

          <div className="card-industrial p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-[#F97316]/20">
                <Thermometer className="w-5 h-5 text-[#F97316]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCharged.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">LBS CHARGED</p>
              </div>
            </div>
          </div>

          <div className="card-industrial p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-muted">
                <Truck className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{assets.length}</p>
                <p className="text-xs text-muted-foreground">FLEET ASSETS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate PDF Button */}
        <Button
          variant="default"
          size="lg"
          className="w-full md:w-auto bg-[#F97316] hover:bg-[#F97316]/90 text-black font-black"
          onClick={handleGeneratePDF}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <FileText className="w-5 h-5" />
              GENERATING...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              GENERATE EPA AUDIT BINDER (PDF)
            </>
          )}
        </Button>

        {/* Mobile Field Mode Button */}
        {(role === 'owner' || role === 'admin') && onEnterFieldMode && (
          <Button
            variant="outline"
            size="lg"
            onClick={onEnterFieldMode}
            className="w-full md:hidden"
          >
            <Wrench className="w-5 h-5 mr-2" />
            ENTER FIELD MODE
          </Button>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-3 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 -mb-[2px] ${
              activeTab === "fleet"
                ? "border-[#F97316] text-[#F97316]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Truck className="w-4 h-4 inline-block mr-2" />
            Fleet Health
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-3 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 -mb-[2px] ${
              activeTab === "logs"
                ? "border-[#F97316] text-[#F97316]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline-block mr-2" />
            Compliance Logs
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading data...
          </div>
        ) : activeTab === "fleet" ? (
          <div className="space-y-3">
            {assets.length === 0 ? (
              <div className="card-industrial p-8 text-center">
                <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No assets registered yet</p>
              </div>
            ) : (
              assets.map((asset) => (
                <div
                  key={asset.id}
                  className="card-industrial p-4 hover:border-[#F97316]/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-foreground truncate">{asset.name}</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {asset.location && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{asset.location}</span>
                          </div>
                        )}
                        {asset.asset_type && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Thermometer className="w-3 h-3" />
                            <span>{asset.asset_type}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="card-industrial p-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No compliance logs yet</p>
              </div>
            ) : (
              logs.map((log) => {
                const delta = log.delta_lbs || (log.start_weight_lbs - log.end_weight_lbs);
                const hasPhoto = !!log.photo_url;
                const hasGPS = log.gps_latitude !== null;
                const status = getLogStatus(log);
                
                return (
                  <div
                    key={log.id}
                    className="card-industrial p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-[#F97316]">
                            {log.cylinder_id ? log.cylinder_id.slice(0, 8) : 'N/A'}
                          </span>
                          <StatusBadge status={status} size="sm" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{log.tech_id.slice(0, 8)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(log.logged_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#F97316] font-bold">
                            <span>{delta.toFixed(1)} LBS</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${hasPhoto ? "text-success" : "text-destructive"}`}>
                              {hasPhoto ? "✓ Photo" : "✗ Photo"}
                            </span>
                            <span className={`text-xs ${hasGPS ? "text-success" : "text-destructive"}`}>
                              {hasGPS ? "✓ GPS" : "✗ GPS"}
                            </span>
                          </div>
                          <div className={`text-sm ${!log.synced ? "text-warning font-bold" : "text-muted-foreground"}`}>
                            {log.synced ? "Synced" : "Pending"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ControlTower;
