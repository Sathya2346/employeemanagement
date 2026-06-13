import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:open_filex/open_filex.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter/material.dart';

class Downloader {
  /// Downloads a file from the given URL string while copying the session cookies
  /// from InAppWebView to authenticate successfully against Spring Security.
  static Future<void> downloadAndOpen(
    BuildContext context,
    String urlString,
    String filename,
    String userAgent,
  ) async {
    // ScaffoldMessenger Helper
    void showMsg(String msg) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }

    try {
      // 1. Request permissions for Android
      if (Platform.isAndroid) {
        bool permissionGranted = false;
        
        // Handle newer Android versions (13+) where storage permission is deprecated
        if (await Permission.photos.request().isGranted) {
          permissionGranted = true;
        } else if (await Permission.storage.request().isGranted) {
          permissionGranted = true;
        }

        if (!permissionGranted) {
          showMsg('Storage permissions are required to download files');
          return;
        }
      }

      // 2. Show native loading dialog
      if (context.mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (dialogContext) => Center(
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF14B8A6)),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Downloading Payslip...',
                    style: TextStyle(
                      color: Color(0xFF1E293B),
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      decoration: TextDecoration.none,
                    ),
                  )
                ],
              ),
            ),
          ),
        );
      }

      // 3. Extract the cookies from InAppWebView container to authenticate the download request
      final cookieManager = CookieManager.instance();
      final uri = WebUri(urlString);
      final cookies = await cookieManager.getCookies(url: uri);
      final cookieHeader = cookies.map((c) => '${c.name}=${c.value}').join('; ');

      // 4. Perform the authenticated HTTP GET download
      final response = await http.get(
        Uri.parse(urlString),
        headers: {
          'User-Agent': userAgent,
          'Cookie': cookieHeader,
        },
      );

      // Dismiss the loading dialog
      if (context.mounted) {
        Navigator.of(context).pop();
      }

      if (response.statusCode == 200) {
        // 5. Save the downloaded bytes locally
        final directory = await getTemporaryDirectory();
        final sanitizedFilename = filename.replaceAll(RegExp(r'[^\w\.\-]'), '_');
        final filePath = '${directory.path}/$sanitizedFilename';
        final file = File(filePath);
        await file.writeAsBytes(response.bodyBytes);

        // 6. Open the file in the device's default PDF viewer
        final result = await OpenFilex.open(filePath);
        if (result.type != ResultType.done) {
          showMsg('Failed to open file: ${result.message}');
        }
      } else {
        showMsg('Server returned error status: ${response.statusCode}');
      }
    } catch (e) {
      // Dismiss dialog if still visible
      if (context.mounted) {
        Navigator.of(context, rootNavigator: true).pop();
      }
      showMsg('Failed to download: $e');
    }
  }
}
