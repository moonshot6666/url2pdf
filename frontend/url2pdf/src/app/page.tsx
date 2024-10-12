'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Link, FileText, Loader2, Check, Download, Play, RefreshCw } from "lucide-react"

const URLToPDFLogo = () => (
  <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="#2563eb" />
    <path d="M20 44V20H36L44 28V44H20Z" fill="white" />
    <path d="M35 20V29H44" fill="#2563eb" />
    <path d="M26 36H38" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
    <path d="M26 40H34" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 25L10 32L15 39" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M49 25L54 32L49 39" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface URLStatus {
  url: string;
  status: 'idle' | 'processing' | 'completed';
}

export default function URLToPDF() {
  const [urlStatuses, setUrlStatuses] = useState<URLStatus[]>([])
  const [inputUrl, setInputUrl] = useState('')
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [allProcessed, setAllProcessed] = useState(false)

  useEffect(() => {
    document.body.style.backgroundColor = '#f8fafc'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValidUrl(inputUrl)) {
      setUrlStatuses(prev => [...prev, { url: inputUrl, status: 'idle' }])
      setInputUrl('')
      toast({
        title: "URL added",
        description: "The URL has been added to the list.",
      })
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      })
    }
  }

  const handleClear = (index: number) => {
    setUrlStatuses(prev => prev.filter((_, i) => i !== index))
    toast({
      title: "URL removed",
      description: "The URL has been removed from the list.",
    })
  }

  const processUrls = async () => {
    setIsProcessing(true)
    for (let i = 0; i < urlStatuses.length; i++) {
      if (urlStatuses[i].status === 'idle') {
        setUrlStatuses(prev => prev.map((status, index) => 
          index === i ? { ...status, status: 'processing' } : status
        ))
  
        try {
          const response = await fetch("http://localhost:8000/add_url_and_generate_pdf", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: urlStatuses[i].url }),
          });
          
          const data = await response.json();
  
          if (response.ok) {
            setUrlStatuses(prev => prev.map((status, index) => 
              index === i ? { ...status, status: 'completed' } : status
            ));
            toast({
              title: "PDF generated",
              description: `Your PDF is ready: ${data.pdf_url}`,
            });
          } else {
            throw new Error(data.detail || 'Failed to process URL');
          }
        } catch (error) {
          toast({
            title: "Error",
            description: `Failed to process URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }
    }
    setIsProcessing(false);
    setAllProcessed(true);
    toast({
      title: "Processing complete",
      description: "All URLs have been processed.",
    });
  }

  const downloadZip = async () => {
    try {
      const response = await fetch("http://localhost:8000/download_zip", {
        method: "GET",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'pdfs.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast({
          title: "Download started",
          description: "Your zip file is being downloaded.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to download zip file: ${errorData.detail}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to download zip file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }

  const areAllUrlsProcessed = urlStatuses.every(status => status.status === 'completed');

  const clearAllUrls = () => {
    setUrlStatuses([]);
    setAllProcessed(false);
    toast({
      title: "All URLs cleared",
      description: "The list has been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl"
      >
        <div className="flex items-center justify-center mb-6">
          <URLToPDFLogo />
          <h1 className="text-4xl font-bold ml-4 bg-gradient-to-r from-blue-600 to-blue-600 text-transparent bg-clip-text">
            URL -&gt; PDF
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter a URL"
                className="pl-10 pr-4 py-2 w-full border-2 border-gray-300 focus:border-blue-600 rounded-lg transition-all duration-300"
              />
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300">
              Add URL
            </Button>
          </div>
        </form>
        <AnimatePresence>
          {urlStatuses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {urlStatuses.map((urlStatus, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center">
                    {urlStatus.status === 'processing' && (
                      <Loader2 className="animate-spin h-5 w-5 mr-2 text-blue-600" />
                    )}
                    {urlStatus.status === 'completed' && (
                      <Check className="h-5 w-5 mr-2 text-green-600" />
                    )}
                    <a href={urlStatus.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate mr-2 flex items-center">
                      <FileText className="mr-2" size={16} />
                      {urlStatus.url}
                    </a>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleClear(index)} className="text-gray-500 hover:text-red-500 transition-colors duration-300">
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Remove URL</span>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {urlStatuses.length > 0 && (
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={downloadZip}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!areAllUrlsProcessed}
            >
              <Download className="mr-2 h-5 w-5" />
              Download All
            </Button>
            <Button 
              onClick={areAllUrlsProcessed ? clearAllUrls : processUrls} 
              className={`font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center ${
                areAllUrlsProcessed 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={isProcessing}
            >
              {areAllUrlsProcessed ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Clear All
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  {isProcessing ? 'Processing...' : 'Process Requests'}
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}