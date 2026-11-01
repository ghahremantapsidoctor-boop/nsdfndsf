import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  X, 
  Server, 
  Globe, 
  ShieldCheck, 
  ExternalLink,
  Terminal
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetId: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, sheetId }) => {
  const [activeFile, setActiveFile] = useState<'proxy' | 'config' | 'htaccess'>('proxy');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const PHP_PROXY_CODE = `<?php
/**
 * TPDR Marketing Intelligence - PHP Backend Bridge
 * Subdomain: tpdr.nexzone.ir
 * Google Sheet ID: ${sheetId}
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'get_sheet_data';
$cacheFile = __DIR__ . '/cache_sheet_data.json';
$cacheDuration = 60; // 60 seconds cache

if ($action === 'get_sheet_data') {
    // Check local cache
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheDuration) && !isset($_GET['force'])) {
        echo file_get_contents($cacheFile);
        exit();
    }

    $csvUrl = "https://docs.google.com/spreadsheets/d/" . GOOGLE_SHEET_ID . "/export?format=csv&gid=" . GOOGLE_SHEET_GID;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $csvUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_USERAGENT, 'TPDR-Dashboard-Agent/1.0');

    $csvContent = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && !empty($csvContent)) {
        $lines = array_map('str_getcsv', explode("\n", trim($csvContent)));
        $response = [
            'success' => true,
            'status' => 'synced',
            'timestamp' => date('Y-m-d H:i:s'),
            'host' => 'tpdr.nexzone.ir',
            'rowCount' => count($lines),
            'rawCsv' => $csvContent,
        ];
        $json = json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        file_put_contents($cacheFile, $json);
        echo $json;
    } else {
        http_response_code(502);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to retrieve spreadsheet data from Google',
            'httpCode' => $httpCode,
        ]);
    }
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action']);
`;

  const CONFIG_PHP_CODE = `<?php
/**
 * Configuration for tpdr.nexzone.ir
 */

define('APP_NAME', 'TPDR Marketing Intelligence');
define('APP_HOST', 'tpdr.nexzone.ir');
define('APP_URL', 'https://tpdr.nexzone.ir');

// Google Spreadsheet
define('GOOGLE_SHEET_ID', '${sheetId}');
define('GOOGLE_SHEET_GID', '0');
define('GOOGLE_SHEET_TAB', 'Aban');

// Security & Authentication
define('SESSION_EXPIRY_HOURS', 24);
define('REQUIRE_2FA', true);
define('ALLOWED_DOMAINS', ['tapsidoctor.com', 'nexzone.ir', 'gmail.com']);
`;

  const HTACCESS_CODE = `# Apache configuration for https://tpdr.nexzone.ir
RewriteEngine On
RewriteBase /

# Force HTTPS on subdomain
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# SPA Routing: Fallback non-file requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
`;

  const activeContent = 
    activeFile === 'proxy' 
      ? PHP_PROXY_CODE 
      : activeFile === 'config' 
      ? CONFIG_PHP_CODE 
      : HTACCESS_CODE;

  const handleCopy = (fileName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadAll = () => {
    const download = (filename: string, content: string) => {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    download('proxy.php', PHP_PROXY_CODE);
    setTimeout(() => download('config.php', CONFIG_PHP_CODE), 300);
    setTimeout(() => download('.htaccess', HTACCESS_CODE), 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl p-6 shadow-2xl relative overflow-hidden text-right max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>پکیج بک‌اند PHP و فایل‌های استقرار سابدامین</span>
                <span className="font-mono text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  tpdr.nexzone.ir
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                کدهای آماده جهت آپلود روی هاست لینوکس، cPanel، DirectAdmin یا Nginx/Apache
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="py-3 px-4 my-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5 shrink-0">
          <p className="font-bold text-emerald-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>راهنمای ۳ مرحله‌ای استقرار روی سابدامین:</span>
          </p>
          <ol className="list-decimal list-inside text-slate-400 space-y-1 leading-relaxed">
            <li>در کنترل‌پنل هاست خود سابدامین <strong className="text-white font-mono">tpdr.nexzone.ir</strong> را بسازید.</li>
            <li>خروجی بیلد این اپلیکیشن (فایل‌های داخل dist شامل index.html) را در پوشه سابدامین قرار دهید.</li>
            <li>فایل‌های PHP زیر را در همان مسیر کپی کنید تا ارتباط با گوگل شیت بدون مشکل CORS و با کش سریع انجام شود.</li>
          </ol>
        </div>

        {/* File Tabs */}
        <div className="flex items-center justify-between gap-2 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFile('proxy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                activeFile === 'proxy'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              api/proxy.php
            </button>
            <button
              onClick={() => setActiveFile('config')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                activeFile === 'config'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              config.php
            </button>
            <button
              onClick={() => setActiveFile('htaccess')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                activeFile === 'htaccess'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              .htaccess
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(activeFile, activeContent)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              {copiedFile === activeFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile === activeFile ? 'کپی شد' : 'کپی کد'}</span>
            </button>
            <button
              onClick={handleDownloadAll}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-900/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود کل پکیج</span>
            </button>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 select-all" dir="ltr">
          <pre>{activeContent}</pre>
        </div>

      </div>
    </div>
  );
};
