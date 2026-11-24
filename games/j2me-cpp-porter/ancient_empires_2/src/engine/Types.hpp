#pragma once

#include "platform/Platform.hpp"
#include <cmath>
#include <cstdint>
#include <string>
#include <vector>

namespace engine {

/// Exact arithmetic right-shift equivalent to Java `v >> shift` (floor division by 2^shift),
/// avoiding C++ negative integer division truncation toward zero (e.g. `-4 / 16 == 0` vs `-4 >> 4 == -1`).
inline int floorDivPow2(int v, int shift) {
    if (shift <= 0 || shift >= 30) return v;
    const int64_t bias = (1LL << shift) - 1;
    const int64_t vv = static_cast<int64_t>(v);
    return vv >= 0 ? static_cast<int>(vv >> shift)
                   : static_cast<int>(-((-vv + bias) >> shift));
}

inline int floorDiv16(int v) {
    return floorDivPow2(v, 4);
}

/// Symmetric sub-tick coordinate interpolation for 60 FPS smoothing of low-Hz J2ME ticks.
/// Synchronize BOTH camera (renderCamX/Y) AND all world entities/particles/projectiles to prevent motion ghosting.
inline int lerpCoordRound(int prev, int curr, float alpha, bool valid = true, int snapThreshold = 96) {
    if (!valid || alpha >= 0.999f || prev == curr) return curr;
    const int64_t d = static_cast<int64_t>(curr) - static_cast<int64_t>(prev);
    if (d > snapThreshold || d < -snapThreshold) return curr;
    return static_cast<int>(std::lround(static_cast<float>(prev) + static_cast<float>(d) * alpha));
}

// J2ME Graphics anchor flags
enum Anchor : int {
    HCENTER  = 1,
    VCENTER  = 2,
    LEFT     = 4,
    RIGHT    = 8,
    TOP      = 16,
    BOTTOM   = 32,
    BASELINE = 64
};

// J2ME Sprite transform constants (0..7)
enum Transform : int {
    TRANS_NONE          = 0,
    TRANS_MIRROR_ROT180 = 1,
    TRANS_MIRROR        = 2,
    TRANS_ROT180        = 3,
    TRANS_MIRROR_ROT270 = 4,
    TRANS_ROT90         = 5,
    TRANS_ROT270        = 6,
    TRANS_MIRROR_ROT90  = 7
};

// J2ME Game Key Bitmasks (from a/c.java)
enum KeyMask : int32_t {
    KEY_0     = 1 << 0,
    KEY_1     = 1 << 1,
    KEY_2     = 1 << 2,
    KEY_3     = 1 << 3,
    KEY_4     = 1 << 4,
    KEY_5     = 1 << 5,
    KEY_6     = 1 << 6,
    KEY_7     = 1 << 7,
    KEY_8     = 1 << 8,
    KEY_9     = 1 << 9,
    KEY_STAR  = 1 << 10,
    KEY_POUND = 1 << 11,
    KEY_UP    = 1 << 12,
    KEY_DOWN  = 1 << 13,
    KEY_LEFT  = 1 << 14,
    KEY_RIGHT = 1 << 15,
    KEY_FIRE  = 1 << 16,
    KEY_LSK   = 1 << 17,
    KEY_RSK   = 1 << 18
};

struct Rect {
    int x = 0;
    int y = 0;
    int w = 0;
    int h = 0;
};

class ByteReader {
public:
    ByteReader() = default;
    explicit ByteReader(const std::vector<uint8_t>& buf)
        : data_(buf.data()), size_(buf.size()), pos_(0) {}
    ByteReader(const uint8_t* data, size_t size)
        : data_(data), size_(size), pos_(0) {}

    bool eof() const { return pos_ >= size_; }
    size_t remaining() const { return pos_ < size_ ? size_ - pos_ : 0; }
    size_t pos() const { return pos_; }
    void setPos(size_t p) { pos_ = p <= size_ ? p : size_; }
    void skip(size_t n) { pos_ = (pos_ + n <= size_) ? (pos_ + n) : size_; }

    int8_t readByte() {
        if (pos_ >= size_) return 0;
        return static_cast<int8_t>(data_[pos_++]);
    }

    uint8_t readUByte() {
        if (pos_ >= size_) return 0;
        return data_[pos_++];
    }

    int16_t readShort() {
        if (pos_ + 2 > size_) { pos_ = size_; return 0; }
        uint16_t v = (static_cast<uint16_t>(data_[pos_]) << 8) | data_[pos_ + 1];
        pos_ += 2;
        return static_cast<int16_t>(v);
    }

    uint16_t readUShort() {
        return static_cast<uint16_t>(readShort());
    }

    int32_t readInt() {
        if (pos_ + 4 > size_) { pos_ = size_; return 0; }
        uint32_t v = (static_cast<uint32_t>(data_[pos_]) << 24) |
                     (static_cast<uint32_t>(data_[pos_ + 1]) << 16) |
                     (static_cast<uint32_t>(data_[pos_ + 2]) << 8) |
                     static_cast<uint32_t>(data_[pos_ + 3]);
        pos_ += 4;
        return static_cast<int32_t>(v);
    }

    int64_t readLong() {
        uint64_t hi = static_cast<uint32_t>(readInt());
        uint64_t lo = static_cast<uint32_t>(readInt());
        return static_cast<int64_t>((hi << 32) | lo);
    }

    std::u16string readUTF() {
        uint16_t len = readUShort();
        if (pos_ + len > size_) len = static_cast<uint16_t>(remaining());
        std::u16string s = platform::modifiedUtf8ToU16(data_ + pos_, len);
        pos_ += len;
        return s;
    }

    void readBytes(uint8_t* dst, size_t len) {
        size_t avail = remaining();
        size_t n = len < avail ? len : avail;
        for (size_t i = 0; i < n; ++i) dst[i] = data_[pos_ + i];
        pos_ += n;
    }

    // Matches a.e.a(byte[], int[]) -> reads dim1, dim2, then dim1*dim2 shorts
    std::vector<int16_t> readFlatShortTable() {
        int16_t r = readShort();
        int16_t c = readShort();
        if (r <= 0 || c <= 0) return {};
        std::vector<int16_t> out(static_cast<size_t>(r) * c);
        for (size_t i = 0; i < out.size(); ++i) {
            out[i] = readShort();
        }
        return out;
    }

    // Matches a.e.b(byte[], int[]) -> reads nGroups, stride, then per-group len * stride shorts
    std::vector<std::vector<int16_t>> readGroupedShortTable() {
        int16_t groups = readShort();
        int16_t stride = readShort();
        if (groups <= 0 || stride <= 0) return {};
        std::vector<std::vector<int16_t>> out(groups);
        for (int g = 0; g < groups; ++g) {
            int16_t count = readShort();
            if (count > 0) {
                out[g].resize(static_cast<size_t>(count) * stride);
                for (size_t i = 0; i < out[g].size(); ++i) {
                    out[g][i] = readShort();
                }
            }
        }
        return out;
    }

    // Matches a.e.a(InputStream) -> short[][]
    std::vector<std::vector<int16_t>> readShortMatrix() {
        int16_t rows = readShort();
        if (rows < 0) return {};
        std::vector<std::vector<int16_t>> out(rows);
        for (int i = 0; i < rows; ++i) {
            int16_t cols = readShort();
            if (cols > 0) {
                out[i].resize(cols);
                for (int j = 0; j < cols; ++j) {
                    out[i][j] = readShort();
                }
            }
        }
        return out;
    }

    // Matches a.e.b(InputStream) -> byte[][]
    std::vector<std::vector<int8_t>> readByteMatrix() {
        int16_t rows = readShort();
        if (rows < 0) return {};
        std::vector<std::vector<int8_t>> out(rows);
        for (int i = 0; i < rows; ++i) {
            int16_t cols = readShort();
            if (cols > 0) {
                out[i].resize(cols);
                for (int j = 0; j < cols; ++j) {
                    out[i][j] = readByte();
                }
            }
        }
        return out;
    }

    // Matches a.e.c(InputStream) -> String[][]
    std::vector<std::vector<std::u16string>> readStringMatrix() {
        int16_t rows = readShort();
        if (rows <= 0) return {};
        std::vector<std::vector<std::u16string>> out(rows);
        for (int i = 0; i < rows; ++i) {
            int16_t cols = readShort();
            if (cols > 0) {
                out[i].resize(cols);
                for (int j = 0; j < cols; ++j) {
                    int len = readUByte();
                    if (len == 255) len = readShort();
                    std::u16string s;
                    if (len > 0) {
                        s.resize(len);
                        for (int k = 0; k < len; ++k) {
                            s[k] = static_cast<char16_t>(readUShort());
                        }
                    }
                    out[i][j] = std::move(s);
                }
            }
        }
        return out;
    }

private:
    const uint8_t* data_ = nullptr;
    size_t size_ = 0;
    size_t pos_ = 0;
};

class ByteWriter {
public:
    void writeByte(int8_t v) { buf_.push_back(static_cast<uint8_t>(v)); }
    void writeUByte(uint8_t v) { buf_.push_back(v); }
    void writeBoolean(bool v) { buf_.push_back(v ? 1 : 0); }

    void writeShort(int16_t v) {
        uint16_t u = static_cast<uint16_t>(v);
        buf_.push_back(static_cast<uint8_t>((u >> 8) & 0xFF));
        buf_.push_back(static_cast<uint8_t>(u & 0xFF));
    }

    void writeInt(int32_t v) {
        uint32_t u = static_cast<uint32_t>(v);
        buf_.push_back(static_cast<uint8_t>((u >> 24) & 0xFF));
        buf_.push_back(static_cast<uint8_t>((u >> 16) & 0xFF));
        buf_.push_back(static_cast<uint8_t>((u >> 8) & 0xFF));
        buf_.push_back(static_cast<uint8_t>(u & 0xFF));
    }

    void writeLong(int64_t v) {
        uint64_t u = static_cast<uint64_t>(v);
        writeInt(static_cast<int32_t>(u >> 32));
        writeInt(static_cast<int32_t>(u & 0xFFFFFFFFULL));
    }

    void writeUTF(const std::u16string& s) {
        std::string utf8 = platform::u16ToUtf8(s);
        uint16_t len = static_cast<uint16_t>(utf8.size());
        writeShort(static_cast<int16_t>(len));
        buf_.insert(buf_.end(), utf8.begin(), utf8.end());
    }

    const std::vector<uint8_t>& data() const { return buf_; }
    std::vector<uint8_t>& data() { return buf_; }

private:
    std::vector<uint8_t> buf_;
};

} // namespace engine
