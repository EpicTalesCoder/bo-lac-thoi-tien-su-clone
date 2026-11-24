#include "platform/SaveSystem.hpp"
#include "platform/Platform.hpp"

#include <algorithm>
#include <cstdio>
#include <cstring>

namespace platform {

namespace {
std::string recordStoreFilePath(const std::string& storeName) {
    return resolveSavePath("rms_" + storeName + ".dat");
}

struct RmsFileHeader {
    char magic[4]; // "RMS1"
    uint32_t count;
};

bool loadAllRecords(const std::string& storeName, std::vector<std::vector<uint8_t>>& records) {
    records.clear();
    std::vector<uint8_t> raw;
    if (!readFileBytes(recordStoreFilePath(storeName), raw)) {
        return false;
    }
    if (raw.size() < sizeof(RmsFileHeader) || std::memcmp(raw.data(), "RMS1", 4) != 0) {
        return false;
    }
    uint32_t count = 0;
    std::memcpy(&count, raw.data() + 4, 4);
    if (count > 4096) {
        return false;
    }
    records.reserve(std::min<size_t>(count, 256));
    size_t pos = 8;
    for (uint32_t i = 0; i < count && pos + 4 <= raw.size(); ++i) {
        uint32_t len = 0;
        std::memcpy(&len, raw.data() + pos, 4);
        pos += 4;
        if (len > raw.size() - pos) {
            records.clear();
            return false;
        }
        records.emplace_back(raw.data() + pos, raw.data() + pos + len);
        pos += len;
    }
    if (records.size() != count) {
        records.clear();
        return false;
    }
    return true;
}

bool saveAllRecords(const std::string& storeName, const std::vector<std::vector<uint8_t>>& records) {
    std::vector<uint8_t> out;
    out.resize(8);
    std::memcpy(out.data(), "RMS1", 4);
    uint32_t count = static_cast<uint32_t>(records.size());
    std::memcpy(out.data() + 4, &count, 4);
    for (const auto& rec : records) {
        uint32_t len = static_cast<uint32_t>(rec.size());
        size_t off = out.size();
        out.resize(off + 4 + len);
        std::memcpy(out.data() + off, &len, 4);
        if (len > 0) {
            std::memcpy(out.data() + off + 4, rec.data(), len);
        }
    }
    return writeFileBytes(recordStoreFilePath(storeName), out.data(), out.size());
}
} // namespace

bool SaveSystem::hasRecordStore(const std::string& storeName) {
    return fileExists(recordStoreFilePath(storeName));
}

int SaveSystem::getNumRecords(const std::string& storeName) {
    std::vector<std::vector<uint8_t>> records;
    if (!loadAllRecords(storeName, records)) {
        return 0;
    }
    return static_cast<int>(records.size());
}

bool SaveSystem::loadRecord(const std::string& storeName, int recordId, std::vector<uint8_t>& out) {
    std::vector<std::vector<uint8_t>> records;
    if (!loadAllRecords(storeName, records)) {
        return false;
    }
    if (recordId < 1 || recordId > static_cast<int>(records.size())) {
        return false;
    }
    out = records[recordId - 1];
    return true;
}

bool SaveSystem::saveRecord(const std::string& storeName, int recordId, const std::vector<uint8_t>& data) {
    std::vector<std::vector<uint8_t>> records;
    loadAllRecords(storeName, records);
    if (recordId <= 0 || recordId > static_cast<int>(records.size())) {
        records.push_back(data);
    } else {
        records[recordId - 1] = data;
    }
    return saveAllRecords(storeName, records);
}

bool SaveSystem::deleteRecordStore(const std::string& storeName) {
    return deleteFile(recordStoreFilePath(storeName));
}

PortSettings SaveSystem::loadSettings() {
    PortSettings s;
    std::vector<uint8_t> raw;
    if (!readFileBytes(resolveSavePath("desktop_settings.cfg"), raw)) {
        return s;
    }
    if (raw.size() < 12 || std::memcmp(raw.data(), "DKP1", 4) != 0) {
        return s;
    }
    uint8_t sm = raw[4];
    s.scaleMode = (sm <= 2) ? static_cast<DisplayScaleMode>(sm) : DisplayScaleMode::FHD_1920x1080;
    s.fullscreen = raw[5] != 0;
    s.highQuality = raw[6] != 0;
    s.bgmVolume = raw[7] <= 5 ? raw[7] : 3;
    s.showPrompts = raw[8] != 0;
    s.speedMultiplier = sanitizeSpeedMultiplier(raw[9]);
    s.smooth60Fps = raw[10] != 0;
    s.showFps = raw[11] != 0;
    if (raw.size() > 12) {
        s.numpadMirrorDpad = raw[12] != 0;
    }
    return s;
}

bool SaveSystem::saveSettings(const PortSettings& s) {
    uint8_t raw[13]{};
    std::memcpy(raw, "DKP1", 4);
    raw[4] = static_cast<uint8_t>(s.scaleMode);
    raw[5] = s.fullscreen ? 1 : 0;
    raw[6] = s.highQuality ? 1 : 0;
    raw[7] = s.bgmVolume <= 5 ? s.bgmVolume : 3;
    raw[8] = s.showPrompts ? 1 : 0;
    raw[9] = sanitizeSpeedMultiplier(s.speedMultiplier);
    raw[10] = s.smooth60Fps ? 1 : 0;
    raw[11] = s.showFps ? 1 : 0;
    raw[12] = s.numpadMirrorDpad ? 1 : 0;
    return writeFileBytes(resolveSavePath("desktop_settings.cfg"), raw, sizeof(raw));
}

} // namespace platform
