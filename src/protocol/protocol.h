//
// Created by caiiiycuk on 27.02.2020.
//

#ifndef JS_DOS_JS_DOS_PROTOCOL_H
#define JS_DOS_JS_DOS_PROTOCOL_H

#include <keyboard.h>
#include <stdint.h>

enum NetworkType {
  NETWORK_NA = -1,
  NETWORK_DOSBOX_IPX = 0,
};

typedef int NetworkId;

// -- Client (Web Page)

void client_frame_set_size(int width, int height);
void client_frame_update_lines(uint32_t* lines, uint32_t count, void* rgba, bool bgra);
void client_sound_init(int freq);
void client_sound_push(const float* samples, int num_samples);
void client_stdout(const char* data, uint32_t amount);

void client_log(const char* tag, const char* message);
void client_warn(const char* tag, const char* message);
void client_error(const char* tag, const char* message);

void client_network_connected(enum NetworkType networkType, const char* address);
void client_network_disconnected(enum NetworkType networkType);

void client_net_recv(int networkId, void *datap, int len);

void client_tick();

// -- Server (Worker)

extern int server_run();
extern void server_add_key(enum KBD_KEYS key, bool pressed, uint64_t pressedMs);
extern void server_mouse_moved(float x, float y, bool relative, uint64_t movedMs);
extern void server_mouse_button(int button, bool pressed, uint64_t pressedMs);
extern void server_mouse_sync(uint64_t syncMs);
extern void server_pause();
extern void server_resume();
extern void server_mute();
extern void server_unmute();
extern void server_exit();

extern void server_network_connect(enum NetworkType networkType, const char* address);
extern void server_network_disconnect(enum NetworkType networkType);

extern int  server_net_connect(const char* address);
extern int  server_net_send(int networkId, const void *datap, int len);
extern void server_net_disconnect(int networkId);

#endif  // JS_DOS_JS_DOS_PROTOCOL_H
