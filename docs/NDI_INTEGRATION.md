# NDI Integration Guide

ShowCall now features professional NDI integration using OBS Studio with WebSocket API control. This is the industry-standard approach used by professional streaming applications.

## Overview

Instead of attempting to implement native NDI protocol handling (which requires complex SDK integration), ShowCall leverages OBS Studio as a bridge:

1. **OBS Studio** with NDI plugin receives native NDI streams from your network
2. **OBS WebSocket API** provides remote control capabilities
3. **ShowCall** controls OBS remotely and receives the processed video stream
4. **Web Browser** displays the stream via standard web video protocols (HLS/WebRTC)

## Setup Requirements

### 1. Install OBS Studio
- Download from [obsproject.com](https://obsproject.com/)
- Version 28.0+ recommended for best WebSocket support

### 2. Install NDI Plugin for OBS
- Download from [NDI website](https://ndi.video/tools/) or [DistroAV](https://github.com/Palakis/obs-ndi)
- This adds "NDI Source" to OBS input sources

### 3. Configure OBS WebSocket
1. Open OBS Studio
2. Go to **Tools → WebSocket Server Settings**
3. Enable WebSocket server
4. Set port to `4455` (default)
5. Set password to `showcall-ndi` (or update in ShowCall config)

### 4. Add NDI Source in OBS
1. Create a new Scene called "ShowCall-NDI-Scene"
2. Add Source → NDI Source
3. Select your NDI source from the network (e.g., 10.1.110.72:5960)
4. Configure NDI settings as needed

## How It Works

### Network Flow
```
NDI Source (10.1.110.72:5960) 
    ↓ [Native NDI Protocol - UDP Multicast]
OBS Studio with NDI Plugin
    ↓ [OBS WebSocket API - TCP]
ShowCall Server (Node.js)
    ↓ [RTMP/HLS Stream - HTTP]
ShowCall Web UI (Browser)
```

### Component Responsibilities

**OBS Studio**:
- Receives native NDI streams
- Processes/encodes video
- Provides WebSocket control interface
- Streams to web-compatible formats

**ShowCall Server**:
- Connects to OBS via WebSocket
- Controls NDI source selection
- Manages streaming parameters
- Provides status monitoring

**ShowCall Web UI**:
- Displays processed video stream
- Controls NDI source switching
- Shows connection status
- Provides quality settings

## API Endpoints

### GET `/api/ndi/status`
Returns current NDI-OBS integration status:
```json
{
  "connected": true,
  "sources": [
    {
      "name": "NDI-ShowCall-NDI-Preview",
      "active": true,
      "settings": {...}
    }
  ],
  "streaming": true,
  "streamUrl": "http://localhost:8080/live/showcall-ndi-stream.m3u8"
}
```

### POST `/api/ndi/switch`
Switch to a specific NDI source:
```json
{
  "sourceName": "NDI-ShowCall-NDI-Preview"
}
```

### POST `/api/ndi/restart`
Restart the NDI-OBS bridge connection.

## Troubleshooting

### "NDI-OBS Bridge not initialized"
- Ensure OBS Studio is installed
- Check that OBS WebSocket is enabled
- Verify port 4455 is not blocked

### "NDI plugin not found in OBS"
- Install the NDI plugin for OBS
- Restart OBS after installation
- Check that "NDI Source" appears in Add Source menu

### "No NDI sources found"
- Verify NDI source is broadcasting on network
- Check firewall settings for UDP multicast
- Test NDI source with NDI Studio Monitor first

### Stream not appearing in browser
- Check OBS is actively streaming
- Verify stream output settings in OBS
- Test stream URL directly in browser

## Professional Benefits

This OBS-based approach provides several advantages over direct NDI integration:

1. **Proven Reliability**: OBS is battle-tested in professional environments
2. **Full NDI Support**: Complete NDI feature set via official plugin
3. **Advanced Processing**: Video filters, effects, and encoding options
4. **Multi-Source**: Easy switching between multiple NDI sources
5. **Web Compatibility**: Automatic conversion to web-friendly formats
6. **Future-Proof**: OBS actively maintained with regular updates

## Configuration Files

### User Config (.env)
```bash
# NDI-OBS Integration
OBS_WEBSOCKET_PORT=4455
OBS_WEBSOCKET_PASSWORD=showcall-ndi
STREAM_OUTPUT_PORT=8080
```

### OBS Scene Collection
ShowCall will automatically create:
- Scene: "ShowCall-NDI-Scene"
- Sources: NDI inputs from discovered sources
- Stream output: RTMP to local server

This professional integration ensures reliable, high-quality NDI streaming that scales with your production needs.