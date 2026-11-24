#include "platform/InputSystem.hpp"
#include "platform/RenderSystem.hpp"

#include <SDL.h>
#include <array>

namespace platform {

namespace {
constexpr uint64_t kRepeatDelayMs = 240;
constexpr uint64_t kRepeatRateMs = 80;
constexpr size_t kActionCount = static_cast<size_t>(Action::COUNT);

std::array<bool, kActionCount> g_prev{};
std::array<bool, kActionCount> g_curr{};
std::array<bool, kActionCount> g_repeated{};
std::array<uint64_t, kActionCount> g_repeatNextMs{};

// Track per-scancode ownership so two keys bound to one Action (e.g. Arrows + WASD)
// or releasing Shift before '#' / '*' never drop or stick key-up events.
std::array<int8_t, SDL_NUM_SCANCODES> g_scancodeAction{};
std::array<int8_t, SDL_NUM_SCANCODES> g_scancodeNumSlot{};

// J2ME 12-key phone pad: '0'..'9', '*', '#'
std::array<bool, 12> g_prevNumKeys{};
std::array<bool, 12> g_currNumKeys{};
std::array<uint64_t, 12> g_numRepeatNextMs{};
constexpr int32_t kNumJ2meCodes[12] = {48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 42, 35};

std::vector<KeyEvent> g_keyEvents;
std::vector<PointerEvent> g_pointerEvents;

Action mapKeyToAction(SDL_Keycode sym) {
    switch (sym) {
        case SDLK_UP:
        case SDLK_w:            return Action::UP;
        case SDLK_DOWN:
        case SDLK_s:            return Action::DOWN;
        case SDLK_LEFT:
        case SDLK_a:            return Action::LEFT;
        case SDLK_RIGHT:
        case SDLK_d:            return Action::RIGHT;
        case SDLK_RETURN:
        case SDLK_KP_ENTER:
        case SDLK_SPACE:
        case SDLK_j:            return Action::FIRE;
        case SDLK_q:
        case SDLK_LEFTBRACKET:
        case SDLK_TAB:          return Action::LSK;
        case SDLK_e:
        case SDLK_RIGHTBRACKET:
        case SDLK_BACKSPACE:    return Action::RSK;
        case SDLK_ESCAPE:
        case SDLK_F1:           return Action::PAUSE;
        case SDLK_F2:           return Action::SPEED;
        case SDLK_F3:           return Action::CHEAT;
        case SDLK_F4:           return Action::SCALE_MODE;
        case SDLK_F11:          return Action::FULLSCREEN;
        case SDLK_F12:          return Action::TOGGLE_FPS;
        default:                return Action::COUNT;
    }
}

int mapKeyToNumSlot(SDL_Keycode sym, uint16_t mod) {
    const bool shiftHeld = (mod & KMOD_SHIFT) != 0;
    if (sym == SDLK_ASTERISK || sym == SDLK_KP_MULTIPLY || (shiftHeld && sym == SDLK_8) || sym == SDLK_KP_MINUS) {
        return 10; // '*' (42)
    }
    if (sym == SDLK_HASH || (shiftHeld && sym == SDLK_3) || sym == SDLK_KP_PLUS) {
        return 11; // '#' (35)
    }
    if (sym >= SDLK_0 && sym <= SDLK_9 && !shiftHeld) {
        return static_cast<int>(sym - SDLK_0);
    }
    switch (sym) {
        case SDLK_KP_0: return 0;
        case SDLK_KP_1: return 1;
        case SDLK_KP_2: return 2;
        case SDLK_KP_3: return 3;
        case SDLK_KP_4: return 4;
        case SDLK_KP_5: return 5;
        case SDLK_KP_6: return 6;
        case SDLK_KP_7: return 7;
        case SDLK_KP_8: return 8;
        case SDLK_KP_9: return 9;
        default:        return -1;
    }
}

int32_t actionToJ2meKey(Action a) {
    switch (a) {
        case Action::UP:    return -1;
        case Action::DOWN:  return -2;
        case Action::LEFT:  return -3;
        case Action::RIGHT: return -4;
        case Action::FIRE:  return -5;
        case Action::LSK:   return -6;
        case Action::RSK:   return -7;
        default:            return 0;
    }
}

void recomputeHeldFromScancodes() {
    g_curr.fill(false);
    g_currNumKeys.fill(false);
    for (size_t sc = 0; sc < SDL_NUM_SCANCODES; ++sc) {
        int8_t act = g_scancodeAction[sc];
        if (act >= 0 && act < static_cast<int8_t>(kActionCount)) {
            g_curr[static_cast<size_t>(act)] = true;
        }
        int8_t slot = g_scancodeNumSlot[sc];
        if (slot >= 0 && slot < 12) {
            g_currNumKeys[static_cast<size_t>(slot)] = true;
        }
    }
}
} // namespace

bool InputSystem::init() {
    resetAllState();
    return true;
}

void InputSystem::shutdown() {
    resetAllState();
}

void InputSystem::beginFrame() {
    g_prev = g_curr;
    g_prevNumKeys = g_currNumKeys;
    g_repeated.fill(false);
}

void InputSystem::handleSdlEvent(const SDL_Event& ev) {
    switch (ev.type) {
        case SDL_KEYDOWN: {
            if (ev.key.repeat) break;
            const SDL_Scancode sc = ev.key.keysym.scancode;
            if (sc < 0 || sc >= SDL_NUM_SCANCODES) break;
            Action a = mapKeyToAction(ev.key.keysym.sym);
            if (a != Action::COUNT) {
                g_scancodeAction[sc] = static_cast<int8_t>(a);
            }
            int slot = mapKeyToNumSlot(ev.key.keysym.sym, ev.key.keysym.mod);
            if (slot >= 0 && slot < 12) {
                g_scancodeNumSlot[sc] = static_cast<int8_t>(slot);
            }
            break;
        }
        case SDL_KEYUP: {
            const SDL_Scancode sc = ev.key.keysym.scancode;
            if (sc >= 0 && sc < SDL_NUM_SCANCODES) {
                g_scancodeAction[sc] = -1;
                g_scancodeNumSlot[sc] = -1;
            }
            break;
        }
        case SDL_MOUSEBUTTONDOWN:
        case SDL_MOUSEBUTTONUP: {
            if (ev.button.button == SDL_BUTTON_LEFT) {
                int gx = 0, gy = 0;
                if (RenderSystem::windowToGameCoords(ev.button.x, ev.button.y, gx, gy)) {
                    g_pointerEvents.push_back({gx, gy, ev.type == SDL_MOUSEBUTTONDOWN});
                }
            }
            break;
        }
        default:
            break;
    }
}

void InputSystem::update(const PortSettings& settings, uint64_t nowMs) {
    recomputeHeldFromScancodes();

    if (settings.numpadMirrorDpad) {
        if (g_currNumKeys[2]) g_curr[static_cast<size_t>(Action::UP)] = true;
        if (g_currNumKeys[8]) g_curr[static_cast<size_t>(Action::DOWN)] = true;
        if (g_currNumKeys[4]) g_curr[static_cast<size_t>(Action::LEFT)] = true;
        if (g_currNumKeys[6]) g_curr[static_cast<size_t>(Action::RIGHT)] = true;
        if (g_currNumKeys[5]) g_curr[static_cast<size_t>(Action::FIRE)] = true;
    }

    for (size_t i = 0; i < kActionCount; ++i) {
        const Action act = static_cast<Action>(i);
        const bool p = g_prev[i];
        const bool c = g_curr[i];
        const int32_t jcode = actionToJ2meKey(act);
        if (c && !p) {
            g_repeated[i] = true;
            g_repeatNextMs[i] = nowMs + kRepeatDelayMs;
            if (jcode != 0) g_keyEvents.push_back({jcode, true});
        } else if (!c && p) {
            g_repeatNextMs[i] = 0;
            if (jcode != 0) g_keyEvents.push_back({jcode, false});
        } else if (c && nowMs >= g_repeatNextMs[i]) {
            g_repeated[i] = true;
            g_repeatNextMs[i] = nowMs + kRepeatRateMs;
            if (act == Action::UP || act == Action::DOWN || act == Action::LEFT || act == Action::RIGHT) {
                if (jcode != 0) g_keyEvents.push_back({jcode, true});
            }
        }
    }

    for (size_t i = 0; i < 12; ++i) {
        if (settings.numpadMirrorDpad && (i == 2 || i == 4 || i == 5 || i == 6 || i == 8)) {
            g_numRepeatNextMs[i] = 0;
            continue;
        }
        const bool p = g_prevNumKeys[i];
        const bool c = g_currNumKeys[i];
        if (c && !p) {
            g_numRepeatNextMs[i] = nowMs + kRepeatDelayMs;
            g_keyEvents.push_back({kNumJ2meCodes[i], true});
        } else if (!c && p) {
            g_numRepeatNextMs[i] = 0;
            g_keyEvents.push_back({kNumJ2meCodes[i], false});
        } else if (c && nowMs >= g_numRepeatNextMs[i]) {
            g_numRepeatNextMs[i] = nowMs + kRepeatRateMs;
            if (i == 2 || i == 4 || i == 6 || i == 8) {
                g_keyEvents.push_back({kNumJ2meCodes[i], true});
            }
        }
    }
}

bool InputSystem::isHeld(Action a) { return g_curr[static_cast<size_t>(a)]; }
bool InputSystem::justPressed(Action a) { size_t i = static_cast<size_t>(a); return g_curr[i] && !g_prev[i]; }
bool InputSystem::justReleased(Action a) { size_t i = static_cast<size_t>(a); return !g_curr[i] && g_prev[i]; }
bool InputSystem::isRepeated(Action a) { return g_repeated[static_cast<size_t>(a)]; }

bool InputSystem::isJ2meKeyHeld(int32_t keyCode) {
    switch (keyCode) {
        case -1: return isHeld(Action::UP);
        case -2: return isHeld(Action::DOWN);
        case -3: return isHeld(Action::LEFT);
        case -4: return isHeld(Action::RIGHT);
        case -5: return isHeld(Action::FIRE);
        case -6: return isHeld(Action::LSK);
        case -7: return isHeld(Action::RSK);
        case 42: return g_currNumKeys[10];
        case 35: return g_currNumKeys[11];
        default:
            if (keyCode >= 48 && keyCode <= 57) return g_currNumKeys[static_cast<size_t>(keyCode - 48)];
            return false;
    }
}

bool InputSystem::justPressedJ2meKey(int32_t keyCode) {
    switch (keyCode) {
        case -1: return justPressed(Action::UP);
        case -2: return justPressed(Action::DOWN);
        case -3: return justPressed(Action::LEFT);
        case -4: return justPressed(Action::RIGHT);
        case -5: return justPressed(Action::FIRE);
        case -6: return justPressed(Action::LSK);
        case -7: return justPressed(Action::RSK);
        case 42: return g_currNumKeys[10] && !g_prevNumKeys[10];
        case 35: return g_currNumKeys[11] && !g_prevNumKeys[11];
        default:
            if (keyCode >= 48 && keyCode <= 57) {
                size_t idx = static_cast<size_t>(keyCode - 48);
                return g_currNumKeys[idx] && !g_prevNumKeys[idx];
            }
            return false;
    }
}

const std::vector<KeyEvent>& InputSystem::pollJ2meKeyEvents() { return g_keyEvents; }
const std::vector<PointerEvent>& InputSystem::pollPointerEvents() { return g_pointerEvents; }

void InputSystem::clearQueues() {
    g_keyEvents.clear();
    g_pointerEvents.clear();
}

void InputSystem::resetAllState() {
    g_prev.fill(false);
    g_curr.fill(false);
    g_repeated.fill(false);
    g_repeatNextMs.fill(0);
    g_prevNumKeys.fill(false);
    g_currNumKeys.fill(false);
    g_numRepeatNextMs.fill(0);
    g_scancodeAction.fill(-1);
    g_scancodeNumSlot.fill(-1);
    g_keyEvents.clear();
    g_pointerEvents.clear();
}

const char* InputSystem::actionName(Action a) {
    switch (a) {
        case Action::UP:         return "Arrows / W (Up)";
        case Action::DOWN:       return "Arrows / S (Down)";
        case Action::LEFT:       return "Arrows / A (Left)";
        case Action::RIGHT:      return "Arrows / D (Right)";
        case Action::FIRE:       return "Enter / Space / J";
        case Action::LSK:        return "Q / [ / Tab";
        case Action::RSK:        return "E / ] / Backspace";
        case Action::PAUSE:      return "Esc / F1";
        case Action::SPEED:      return "F2";
        case Action::CHEAT:      return "F3";
        case Action::SCALE_MODE: return "F4";
        case Action::FULLSCREEN: return "F11";
        case Action::TOGGLE_FPS: return "F12";
        default:                 return "?";
    }
}

const char* InputSystem::j2meKeyLabel(int32_t keyCode) {
    switch (keyCode) {
        case -1: return "Lên / Nhảy (Mũi tên Lên / W)";
        case -2: return "Xuống (Mũi tên Xuống / S)";
        case -3: return "Trái (Mũi tên Trái / A)";
        case -4: return "Phải (Mũi tên Phải / D)";
        case -5: return "Chọn giữa / Đánh / OK (Enter / Space)";
        case -6: return "Phím mềm Trái LSK (Q / Tab / [)";
        case -7: return "Phím mềm Phải RSK (E / Backspace / ])";
        case 42: return "Phím * (* / KP_* / Shift+8)";
        case 35: return "Phím # (# / KP_+ / Shift+3)";
        default:
            if (keyCode >= 48 && keyCode <= 57) return "Phím số điện thoại (0..9 / Numpad)";
            return "Chưa gán";
    }
}

} // namespace platform
