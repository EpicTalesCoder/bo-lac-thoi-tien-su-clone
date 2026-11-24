#include "game/Sprite.hpp"
#include "game/PakAndLang.hpp"

#include <cstdio>

namespace game {

ImageRegion::ImageRegion(const std::string& name, int teamId) {
    const std::vector<uint8_t>* bytes = PakStore::getBytes(name + ".png");
    if (!bytes) return;
    img = engine::Image::createFromMemory(bytes->data(), bytes->size());
    if (teamId != 1 && img && img->isValid()) {
        img = img->cloneWithTeamPalette(teamId);
    }
    if (img && img->isValid()) {
        w = img->getWidth();
        h = img->getHeight();
    }
    isSub = false;
}

ImageRegion::ImageRegion(const ImageRegion& parent, int col, int row, int fw, int fh) {
    img = parent.img;
    w = fw;
    h = fh;
    srcX = col * fw + parent.srcX;
    srcY = row * fh + parent.srcY;
    isSub = true;
}

ImageRegion::ImageRegion(const ImageRegion& src, int transformFlags) {
    img = src.img;
    w = src.w;
    h = src.h;
    srcX = src.srcX;
    srcY = src.srcY;
    offX = src.offX;
    offY = src.offY;
    isSub = src.isSub;
    if ((transformFlags & 1) != 0) transform = engine::TRANS_MIRROR;
    else if ((transformFlags & 2) != 0) transform = engine::TRANS_MIRROR_ROT180;
    else if ((transformFlags & 4) != 0) transform = engine::TRANS_ROT270;
    else if ((transformFlags & 8) != 0) transform = engine::TRANS_ROT180;
    else if ((transformFlags & 16) != 0) transform = engine::TRANS_ROT90;
    else transform = engine::TRANS_NONE;
}

void ImageRegion::applyAnchorOffset(int anchor, int fw, int fh) {
    if (isSub) return;
    int hMask = anchor & 13;
    int vMask = anchor & 50;
    if (transform == engine::TRANS_MIRROR) {
        if ((hMask & 4) != 0) hMask = 8;
        else if ((hMask & 8) != 0) hMask = 4;
    } else if (transform == engine::TRANS_MIRROR_ROT180) {
        if ((vMask & 16) != 0) vMask = 32;
        else if ((vMask & 32) != 0) vMask = 16;
    }
    int comb = hMask | vMask;
    if ((comb & 8) != 0) offX = fw - w;
    else if ((comb & 1) != 0) offX = (fw - w) >> 1;
    if ((comb & 32) != 0) offY = fh - h;
    else if ((comb & 2) != 0) offY = (fh - h) >> 1;
}

void ImageRegion::addOffset(int dx, int dy) {
    offX += dx;
    offY += dy;
}

void ImageRegion::draw(engine::GraphicsContext& g, int x, int y, int anchor) const {
    if (!img || !img->isValid()) return;
    if (!isSub && transform == engine::TRANS_NONE) {
        g.drawImage(img, x + offX, y + offY, anchor);
    } else {
        g.drawRegion(img, srcX, srcY, w, h, transform, x + offX, y + offY, anchor);
    }
}

Sprite::Sprite(const std::string& name, int teamId) {
    loadFromPak(name, teamId);
}

Sprite::Sprite(std::vector<ImageRegion> regions) : frames(std::move(regions)) {
    seq.resize(frames.size());
    for (size_t i = 0; i < frames.size(); ++i) {
        seq[i] = static_cast<uint8_t>(i);
    }
    if (!frames.empty()) {
        frameW = frames[0].w;
        frameH = frames[0].h;
    }
}

Sprite::Sprite(int w, int h) : frameW(w), frameH(h) {}

Sprite::Sprite(const Sprite& other)
    : frames(other.frames),
      seq(other.seq),
      anims(other.anims),
      frameIdx(other.frameIdx),
      x(other.x),
      y(other.y),
      prevX(other.x),
      prevY(other.y),
      zOff(other.zOff),
      prevZOff(other.zOff),
      visible(other.visible),
      frameW(other.frameW),
      frameH(other.frameH),
      frameDelayMs(other.frameDelayMs) {
}

void Sprite::loadFromPak(const std::string& name, int teamId) {
    const std::vector<uint8_t>* bytes = PakStore::getBytes(name + ".sprite");
    if (!bytes) return;
    engine::ByteReader r(*bytes);
    int count = static_cast<int8_t>(r.readByte());
    frameW = static_cast<int8_t>(r.readByte());
    frameH = static_cast<int8_t>(r.readByte());
    if (count <= 0) return;

    frames.resize(static_cast<size_t>(count));
    std::vector<ImageRegion> rawRegs(static_cast<size_t>(count));

    if (PakStore::exists(name + ".png")) {
        ImageRegion sheet(name, teamId);
        int cols = (frameW > 0) ? (sheet.w / frameW) : 0;
        int rows = (frameH > 0) ? (sheet.h / frameH) : 0;
        int idx = 0;
        for (int row = 0; row < rows && idx < count; ++row) {
            for (int col = 0; col < cols && idx < count; ++col) {
                rawRegs[static_cast<size_t>(idx++)] = ImageRegion(sheet, col, row, frameW, frameH);
            }
        }
    } else {
        for (int i = 0; i < count; ++i) {
            char buf[64];
            std::snprintf(buf, sizeof(buf), "%s_%02d", name.c_str(), i);
            rawRegs[static_cast<size_t>(i)] = ImageRegion(buf, teamId);
        }
    }

    for (int i = 0; i < count; ++i) {
        int rawIdx = r.readUByte();
        int trans = r.readUByte();
        if (rawIdx >= 0 && rawIdx < count) {
            frames[static_cast<size_t>(i)] = ImageRegion(rawRegs[static_cast<size_t>(rawIdx)], trans);
        }
    }

    int anchor = r.readUByte();
    if (anchor > 0) {
        for (int i = 0; i < count; ++i) {
            frames[static_cast<size_t>(i)].applyAnchorOffset(anchor, frameW, frameH);
        }
    }

    int animCount = r.readUByte();
    if (animCount > 0 && animCount < 128) {
        anims.resize(static_cast<size_t>(animCount));
        frameDelayMs = r.readUByte() * 50;
        for (int a = 0; a < animCount; ++a) {
            int seqLen = r.readUByte();
            anims[static_cast<size_t>(a)].resize(static_cast<size_t>(seqLen));
            for (int j = 0; j < seqLen; ++j) {
                anims[static_cast<size_t>(a)][static_cast<size_t>(j)] = r.readUByte();
            }
        }
    }

    for (int i = 0; i < count && r.remaining() >= 2; ++i) {
        int8_t dx = r.readByte();
        int8_t dy = r.readByte();
        if (dx == -1 || dy == -1) break;
        frames[static_cast<size_t>(i)].addOffset(dx, dy);
    }

    if (!anims.empty()) {
        seq = anims[0];
    } else {
        seq.resize(static_cast<size_t>(count));
        for (int i = 0; i < count; ++i) seq[static_cast<size_t>(i)] = static_cast<uint8_t>(i);
    }
}

void Sprite::setFrameIndex(int idx) {
    if (idx >= 0 && idx < static_cast<int>(seq.size())) {
        frameIdx = idx;
    }
}

void Sprite::setPos(int nx, int ny) {
    x = nx;
    y = ny;
}

void Sprite::advanceFrame() {
    if (seq.empty()) return;
    ++frameIdx;
    if (frameIdx >= static_cast<int>(seq.size())) {
        frameIdx = 0;
    }
}

void Sprite::setSequence(std::vector<uint8_t> newSeq) {
    seq = std::move(newSeq);
    frameIdx = 0;
    animTimerMs = 0;
}

void Sprite::setAnim(int animIdx, bool useUpperHalf) {
    if (anims.empty() || animIdx < 0 || animIdx >= static_cast<int>(anims.size())) return;
    std::vector<uint8_t> s = anims[static_cast<size_t>(animIdx)];
    if (useUpperHalf) {
        uint8_t half = static_cast<uint8_t>(totalFrames() / 2);
        for (uint8_t& v : s) v = static_cast<uint8_t>(v + half);
    }
    setSequence(std::move(s));
}

std::unique_ptr<Sprite> Sprite::createFloatingText(const std::string& txt, int vxIn, int gravY, int fontId) {
    int w = SpriteFont::stringWidth(fontId, txt);
    int h = SpriteFont::height(fontId);
    auto sp = std::make_unique<Sprite>(w, h);
    sp->textFontId = fontId;
    sp->text = txt;
    sp->vx = vxIn;
    sp->gravityY = gravY;
    sp->kind = 5;
    return sp;
}

std::unique_ptr<Sprite> Sprite::createEffect(const Sprite* proto, int vxIn, int vyIn, int gravY,
                                             int loops, int delayMs, uint8_t k) {
    std::unique_ptr<Sprite> sp;
    if (proto) {
        sp = std::make_unique<Sprite>(*proto);
    } else {
        sp = std::make_unique<Sprite>(0, 0);
        if (k == 2 || k == 4) {
            if (k == 4) sp->particleColor = 15658751;
            for (int i = 0; i < 5; ++i) {
                sp->pAlive[static_cast<size_t>(i)] = true;
                if (k == 4) {
                    sp->pVel[static_cast<size_t>(i)][0] = static_cast<int16_t>((GameRng::nextInt() % 4) * (1 << 10));
                    sp->pVel[static_cast<size_t>(i)][1] = static_cast<int16_t>((GameRng::nextInt() % 4) * (1 << 10));
                } else {
                    sp->pVel[static_cast<size_t>(i)][0] = static_cast<int16_t>(GameRng::nextInt(8192) - 4096);
                    sp->pVel[static_cast<size_t>(i)][1] = static_cast<int16_t>(GameRng::nextInt(4096) - 2048);
                }
                sp->pSize[static_cast<size_t>(i)] = static_cast<uint8_t>(GameRng::nextInt(2) + 1);
            }
        }
    }
    sp->kind = k;
    sp->loopsLeft = loops;
    sp->frameDelayMs = delayMs;
    sp->vx = vxIn;
    sp->vy = vyIn;
    sp->gravityY = gravY;
    sp->removeWhenDone = true;
    return sp;
}

void Sprite::tick() {
    if (!alive) return;
    animTimerMs += 50;
    if (shakeTicks >= 0) --shakeTicks;

    switch (kind) {
        case 2:
        case 4:
            tickParticles();
            return;
        case 3:
            setPos(x + vx, y + vy);
            return;
        case 5:
            if (loopsLeft == -1) {
                setPos(x + vx, y);
                zOff += gravityY;
                if (zOff < 0) {
                    ++gravityY;
                    return;
                }
                zOff = 0;
                gravityY = -gravityY / 2;
                if (gravityY == 0) {
                    loopsLeft = 1;
                    animTimerMs = 0;
                }
            } else if (animTimerMs >= 400) {
                alive = false;
            }
            return;
        case 6:
            frameIdx = (frameIdx + 1) % 2;
            if (animTimerMs >= frameDelayMs) alive = false;
            return;
        default:
            setPos(x + vx, y + vy);
            zOff += gravityY;
            if (loopsLeft != 0 && animTimerMs >= frameDelayMs) {
                advanceFrame();
                if (kind == 0 && frameIdx == 0 && loopsLeft > 0) {
                    --loopsLeft;
                    if (loopsLeft <= 0) {
                        setFrameIndex(seqLength() - 1);
                        if (removeWhenDone) alive = false;
                    }
                }
                animTimerMs = 0;
            }
            return;
    }
}

void Sprite::tickParticles() {
    if (kind != 4) {
        particleColor += -263168;
    }
    for (int i = 0; i < 5; ++i) {
        size_t idx = static_cast<size_t>(i);
        if (!pAlive[idx]) continue;
        pPos[idx][0] += pVel[idx][0];
        pPos[idx][1] += pVel[idx][1];
        if (kind == 4) {
            if (pVel[idx][0] < 0) pVel[idx][0] = static_cast<int16_t>(pVel[idx][0] + 256);
            else if (pVel[idx][0] > 0) pVel[idx][0] = static_cast<int16_t>(pVel[idx][0] - 256);
            if (pVel[idx][1] < 0) pVel[idx][1] = static_cast<int16_t>(pVel[idx][1] + 256);
            else if (pVel[idx][1] > 0) pVel[idx][1] = static_cast<int16_t>(pVel[idx][1] - 256);
        } else {
            pVel[idx][1] = static_cast<int16_t>(pVel[idx][1] + 256);
        }
    }
    if (animTimerMs >= frameDelayMs) alive = false;
}

void Sprite::drawFrame(engine::GraphicsContext& g, int slot, int offX, int offY, int anchor) {
    if (kind == 2 || kind == 4 || kind == 3) {
        draw(g, offX, offY);
        return;
    }
    if (visible && slot >= 0 && slot < static_cast<int>(frames.size())) {
        frames[static_cast<size_t>(slot)].draw(g, x + offX, y + offY, anchor);
    }
}

void Sprite::drawCurrent(engine::GraphicsContext& g, int offX, int offY, int anchor) {
    if (seq.empty() || frameIdx < 0 || frameIdx >= static_cast<int>(seq.size())) return;
    drawFrame(g, seq[static_cast<size_t>(frameIdx)], offX, offY, anchor);
}

void Sprite::draw(engine::GraphicsContext& g, int offX, int offY) {
    if (kind == 2 || kind == 4) {
        g.setColor(particleColor);
        for (int i = 0; i < 5; ++i) {
            size_t idx = static_cast<size_t>(i);
            if (pAlive[idx]) {
                int px = engine::floorDivPow2(pPos[idx][0], 10) + offX + x;
                int py = engine::floorDivPow2(pPos[idx][1], 10) + offY + y;
                int sz = pSize[idx];
                g.fillRect(px, py, sz, sz);
            }
        }
        return;
    }
    if (kind == 6) {
        g.setColor(frameIdx == 0 ? 15718144 : 16777215);
        if (vx > 0) {
            int cx = x + 15;
            g.fillArc(x, y - 15, 30, 30, 0, 360);
            g.fillRect(cx, y - 15, 240 - cx, 30);
        } else {
            g.fillArc(x - 30, y - 15, 30, 30, 0, 360);
            g.fillRect(0, y - 15, x - 15, 30);
        }
        return;
    }
    if (kind == 3) {
        g.setColor(0);
        if (vx > 0) g.drawLine(x, y, x + 4, y - 2);
        else g.drawLine(x - 4, y - 2, x, y);
        return;
    }
    if (!visible) return;
    int dx = x + offX;
    int dy = y + offY;
    if (!text.empty()) {
        SpriteFont::draw(g, text, dx, dy, textFontId, engine::HCENTER | engine::BOTTOM);
        return;
    }
    if (shakeTicks > 0) {
        dx += GameRng::range(-4, 5);
        dy += GameRng::range(-1, 2);
    }
    if (seq.empty() || frameIdx < 0 || frameIdx >= static_cast<int>(seq.size())) return;
    uint8_t fIdx = seq[static_cast<size_t>(frameIdx)];
    if (fIdx < frames.size()) {
        frames[fIdx].draw(g, dx, dy);
    }
    if (kingHeadFront) {
        int halfCount = totalFrames() / 2;
        int headVariant = (halfCount > 0) ? (fIdx % halfCount) : 0;
        Sprite* overlay = (headVariant == 2 && kingHeadBack) ? kingHeadBack : kingHeadFront;
        if (overlay == kingHeadFront) kingHeadFront->setFrameIndex(headVariant);
        if (overlay) overlay->draw(g, dx, dy);
    }
}

} // namespace game
