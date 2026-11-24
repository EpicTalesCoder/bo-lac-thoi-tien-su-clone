#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace platform {

bool init(const char* appSlug = "j2me_port");
void shutdown();

std::string resolveRomfsPath(const std::string& relPath);
std::string resolveSavePath(const std::string& filename);

bool readRomfsFile(const std::string& relPath, std::vector<uint8_t>& out);
bool romfsFileExists(const std::string& relPath);
bool writeFileBytes(const std::string& absPath, const uint8_t* data, size_t size);
bool readFileBytes(const std::string& absPath, std::vector<uint8_t>& out);
bool deleteFile(const std::string& absPath);
bool fileExists(const std::string& absPath);

uint64_t getTicksMs();
uint64_t getGameTicksMs();
void advanceGameTicksMs(uint64_t deltaMs);
void resetGameTicksMs(uint64_t valueMs = 1000ULL);
uint64_t getUiTicksMs();
void advanceUiTicksMs(uint64_t deltaMs);
void resetUiTicksMs(uint64_t valueMs = 1000ULL);

// Unicode helpers (UTF-8 <-> UTF-16 for exact J2ME charAt/substring semantics)
std::u16string utf8ToU16(const std::string& utf8);
std::string u16ToUtf8(const std::u16string& u16);
std::u16string utf16beToU16(const uint8_t* data, size_t byteLen);
std::u16string modifiedUtf8ToU16(const uint8_t* data, size_t byteLen);

} // namespace platform
