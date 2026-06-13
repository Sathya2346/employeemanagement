import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../utils/downloader.dart';
import 'error_screen.dart';

class WebViewScreen extends StatefulWidget {
  final String url;

  const WebViewScreen({super.key, required this.url});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  InAppWebViewController? _webViewController;
  PullToRefreshController? _pullToRefreshController;
  
  double _loadProgress = 0;
  bool _isOffline = false;
  late StreamSubscription<List<ConnectivityResult>> _connectivitySubscription;

  @override
  void initState() {
    super.initState();

    // 1. Set up connection monitoring
    _connectivitySubscription = Connectivity()
        .onConnectivityChanged
        .listen((List<ConnectivityResult> results) {
      final isNowOffline = results.isEmpty || 
          (results.length == 1 && results.first == ConnectivityResult.none);
      
      setState(() {
        _isOffline = isNowOffline;
      });
      
      if (!isNowOffline && _webViewController != null) {
        _webViewController!.reload();
      }
    });

    // 2. Set up pull-to-refresh controller
    _pullToRefreshController = kIsWeb
        ? null
        : PullToRefreshController(
            settings: PullToRefreshSettings(
              color: const Color(0xFF6366F1), // Indigo loader
              backgroundColor: Colors.white,
            ),
            onRefresh: () async {
              if (defaultTargetPlatform == TargetPlatform.android) {
                _webViewController?.reload();
              } else if (defaultTargetPlatform == TargetPlatform.iOS) {
                _webViewController?.loadUrl(
                  urlRequest: URLRequest(url: await _webViewController?.getUrl()),
                );
              }
            },
          );
  }

  @override
  void dispose() {
    _connectivitySubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isOffline) {
      return ErrorScreen(
        onRetry: () async {
          final results = await Connectivity().checkConnectivity();
          final hasNet = results.isNotEmpty && !results.contains(ConnectivityResult.none);
          if (hasNet) {
            setState(() {
              _isOffline = false;
            });
            _webViewController?.reload();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Still offline. Check connection.'),
                behavior: SnackBarBehavior.floating,
              ),
            );
          }
        },
      );
    }

    // Handing back navigation correctly
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) async {
        if (didPop) return;
        if (_webViewController != null && await _webViewController!.canGoBack()) {
          _webViewController!.goBack();
        } else {
          // If no more history, allow exit
          if (context.mounted) {
            final shouldExit = await showDialog<bool>(
              context: context,
              builder: (context) => AlertDialog(
                title: const Text('Exit App'),
                content: const Text('Do you want to close the application?'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    child: const Text('Exit'),
                  ),
                ],
              ),
            );
            if (shouldExit == true) {
              // Programmatically close the app
              Navigator.of(context).pop();
            }
          }
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Stack(
            children: [
              // Core WebView Container
              InAppWebView(
                initialUrlRequest: URLRequest(url: WebUri(widget.url)),
                initialSettings: InAppWebViewSettings(
                  useShouldOverrideUrlLoading: true,
                  mediaPlaybackRequiresUserGesture: false,
                  useOnDownloadStart: true,
                  javaScriptEnabled: true,
                  domStorageEnabled: true,
                  supportZoom: false,
                  allowsBackForwardNavigationGestures: true,
                  sharedCookiesEnabled: true,
                  thirdPartyCookiesEnabled: true,
                ),
                pullToRefreshController: _pullToRefreshController,
                onWebViewCreated: (controller) {
                  _webViewController = controller;
                },
                onLoadStart: (controller, url) {
                  setState(() {
                    _loadProgress = 0;
                  });
                },
                onLoadStop: (controller, url) async {
                  _pullToRefreshController?.endRefreshing();
                  setState(() {
                    _loadProgress = 1.0;
                  });
                },
                onProgressChanged: (controller, progress) {
                  setState(() {
                    _loadProgress = progress / 100;
                  });
                },
                onLoadError: (controller, url, code, message) {
                  _pullToRefreshController?.endRefreshing();
                  if (code == -1009 || message.contains('ERR_INTERNET_DISCONNECTED')) {
                    setState(() {
                      _isOffline = true;
                    });
                  }
                },
                // Intercept file downloads (Payslip PDF)
                onDownloadStartRequest: (controller, downloadRequest) async {
                  final url = downloadRequest.url.toString();
                  final filename = downloadRequest.suggestedFilename ?? 'payslip.pdf';
                  final userAgent = downloadRequest.userAgent ?? '';
                  
                  await Downloader.downloadAndOpen(
                    context,
                    url,
                    filename,
                    userAgent,
                  );
                },
              ),
              
              // Top-aligned loading bar progress indicator
              if (_loadProgress < 1.0)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  child: LinearProgressIndicator(
                    value: _loadProgress,
                    backgroundColor: Colors.transparent,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF14B8A6)), // Teal
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
