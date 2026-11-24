#pragma once

#include "engine/GraphicsContext.hpp"
#include "game/BattleSide.hpp"
#include "game/PakAndLang.hpp"
#include "game/Panel.hpp"
#include "game/Sprite.hpp"
#include "game/Unit.hpp"
#include <array>
#include <cstdint>
#include <memory>
#include <string>
#include <vector>

namespace game {

class GameEngine {
public:
    static constexpr int kBattleHudHeight = 32;
    static constexpr int kMaxPlayers = 4;

    static const int8_t kTerrainDef[10];
    static const int8_t kTerrainCost[10];
    static const int kTeamColors[5];
    static const int kSkirmishStartingGold[3];
    static const int kSkirmishUnitCap[3];

    GameEngine();
    ~GameEngine();

    bool init(int w, int h);
    void shutdown();
    void resize(int w, int h);

    void tick();
    void render(engine::GraphicsContext& g, float renderAlpha, bool smooth60Fps);

    void onKeyPressed(int32_t j2meKey);
    void onKeyReleased(int32_t j2meKey);
    void clearHeldInputs();

    // Panel / Engine helpers
    void pushPanel(Panel* panel);
    void popPanel(Panel* target = nullptr);
    void onPanelAction(Panel* panel, int itemIdx, const std::string& itemText, int8_t actionType);

    Sprite* getUnitSpriteTemplate(int8_t teamId, int8_t type);
    Unit* getUnitAt(int gx, int gy, uint8_t layerState); // layerState: 0=alive, 1=grave
    int8_t getTerrainAt(int gx, int gy) const;
    bool isBuildingAllied(int gx, int gy, int alliance) const;
    bool isBuildingOwnedBy(int gx, int gy, int player) const;
    int findBuildingIndex(int gx, int gy) const;
    void setBuildingOwner(int gx, int gy, int8_t teamId);
    void destroyTownAt(int8_t teamId, int gx, int gy);

    Sprite* spawnEffect(const Sprite* proto, int x, int y, int vx, int vy, int loops, int delayMs);
    void addBattleSprite(std::unique_ptr<Sprite> sp);
    Sprite* createBattleEffect(const Sprite* proto, int vx, int vy, int gravY, int loops, int delayMs, uint8_t kind);
    void removeUnit(Unit* u);
    void triggerBattleShake(int durMs);

    void centerCameraOnGrid(int gx, int gy);
    void setCursorGrid(int gx, int gy);
    bool moveCameraToward(int worldPxX, int worldPxY);
    void drawActiveScreenBackground(engine::GraphicsContext& g);
    void drawSoftkeyLabel(engine::GraphicsContext& g, int32_t keyBit, int side, int yBottom);
    static int lerpColor(int c0, int c1, int step, int maxStep);
    static int lerpColorTri(int c0, int c1, int c2);

    // Save / Load
    bool hasSavedGame() const;
    bool saveCurrentGame();
    bool loadSavedGame();
    void loadSettingsRecord();
    void saveSettingsRecord();
    void startNewCampaign(int stage);
    void startSkirmishMatch();

    // Dimensions
    int screenW = 240;
    int screenH = 320;
    int gamePanelHeight = 304;
    int battleViewH = 288;
    int battleHalfW = 120;

    // Top-level engine state: 0=intro/logo, 1=ingame, 2=title/menu, 3=gameover
    int8_t appState = 0;
    int8_t playState = 0; // i.c
    int8_t prevPlayState = 0; // i.d
    int introStep = 0;
    int loadingProgress = 0;
    uint64_t gameTimeMs = 0;
    uint64_t stateTimerMs = 0;
    uint64_t titleAnimMs = 0;

    // Settings (sound, vibrate, tips, fightAnim)
    bool optSound = true;
    bool optVibrate = true;
    bool optTips = true;
    bool optFightAnim = true;

    GameInput input;

    // Map & Tiles
    int castleTileStart = 0;
    std::vector<ImageRegion> tileRegions;
    std::vector<ImageRegion> miniIcons;
    std::vector<int8_t> tileTerrain;
    int mapW = 0;
    int mapH = 0;
    int mapPxW = 0;
    int mapPxH = 0;
    std::vector<std::vector<int8_t>> mapTiles;
    std::vector<std::vector<int8_t>> moveCostGrid;
    std::vector<std::vector<int8_t>> aiFloodGrid;
    std::vector<std::array<int8_t, 3>> buildings; // {gx, gy, teamOwner}
    std::vector<std::array<int8_t, 2>> brokenTowns;
    std::vector<int> buildingScore;
    std::vector<Unit*> buildingOccupier;
    std::vector<int8_t> buildingRepairTurn;
    std::vector<std::unique_ptr<Sprite>> buildingSmoke;

    // Camera & Cursor (with 60fps interpolation)
    int camX = 0;
    int camY = 0;
    int prevCamX = 0;
    int prevCamY = 0;
    int targetCamX = 0;
    int targetCamY = 0;
    bool interpValid = false;
    int cursorGx = 0;
    int cursorGy = 0;
    int savedCursorGx = 0;
    int savedCursorGy = 0;
    bool showCursor = true;
    bool showGridRanges = false;
    bool mapDirty = true;
    bool hudDirty = true;
    bool battleHudDirty = false;
    bool softkeyBarDirty = true;
    bool showMoveRange = false;
    bool showAttackRange = false;

    // Game Mode & Players
    int8_t gameMode = 0; // 0=campaign, 1=skirmish
    int missionIdx = 0;
    int maxCampaignUnlocked = 0;
    int turnNumber = 1;
    int playerCount = 2;
    int8_t currentPlayer = 0;
    std::array<int8_t, kMaxPlayers> playerTeam{1, 2, 3, 4};
    std::array<int8_t, kMaxPlayers> playerAlliance{0, 1, 2, 3};
    std::array<int8_t, kMaxPlayers> playerControl{1, 0, 2, 2}; // 0=AI, 1=Human, 2=None
    std::array<int, kMaxPlayers> playerGold{0, 0, 0, 0};
    std::array<std::array<int8_t, 2>, kMaxPlayers> playerLastCursor{};
    std::array<Unit*, kMaxPlayers> mainCommander{};
    std::array<std::array<Unit*, 8>, kMaxPlayers> commanders{};
    std::array<int, kMaxPlayers> commanderCount{};

    int skirmishGoldIdx = 0;
    int skirmishCapIdx = 1;
    int skirmishMaxUnits = 20;
    int maxBuyUnitType = 8;

    // Units & Effects
    std::vector<std::unique_ptr<Unit>> units;
    std::vector<std::unique_ptr<Unit>> tempUnits;
    std::vector<std::unique_ptr<Sprite>> worldEffects;
    std::vector<std::unique_ptr<Sprite>> battleSprites;

    Unit* selectedUnit = nullptr;
    Unit* lastMovedUnit = nullptr;
    Unit* graveTarget = nullptr;
    Unit* attackerUnit = nullptr;
    Unit* defenderUnit = nullptr;
    std::vector<Unit*> attackTargets;
    int attackTargetIdx = 0;
    int actionMenuIdx = 0;
    std::vector<int> currentActionIds;
    std::string mapTitle;

    // Battle scene
    int battleMode = 0; // 0=normal, 1=catapult-vs-town
    std::unique_ptr<BattleSide> battleLeft;
    std::unique_ptr<BattleSide> battleRight;
    int battlePhase = 0;
    uint64_t battleTimerMs = 0;
    bool battleShakeActive = false;
    uint64_t battleShakeEndMs = 0;
    int battleShakeOffX = 0;
    int battleShakeOffY = 0;

    // AI state
    std::vector<Unit*> aiPendingUnits;
    int8_t aiPhase = 0;
    int aiSubStep = 0;
    uint64_t aiTimerMs = 0;
    int aiDestGx = 0;
    int aiDestGy = 0;
    Unit* aiActiveUnit = nullptr;
    Unit* aiAttackTarget = nullptr;
    Unit* aiGraveTarget = nullptr;
    Unit* aiBlockerUnit = nullptr;
    int aiGoalGx = -1;
    int aiGoalGy = -1;
    int aiGoalBuildingIdx = -1;
    int aiBestScore = 0;
    int aiBuildingOwnerIdx = -1;

    // Campaign / Story state
    int campaignEventStep = 0;
    int campaignTriggerLock = 0;
    int pendingTipId = -1;
    bool transitionCurtain = false;
    int transitionTick = 0;
    bool heavenFuryActive = false;
    bool heavenFuryShowBeam = false;
    int heavenFuryPhase = 0;
    uint64_t heavenFuryTimerMs = 0;
    bool heavenFuryFlash = false;
    int heavenFuryBeamW = 0;
    int heavenFuryBeamGx = 0;
    int heavenFuryBeamGy = 0;
    int heavenFuryTargetGx = 0;
    int heavenFuryTargetGy = 0;
    bool isMissionWon = false;
    bool victoryScreenActive = false;
    bool missionDefeated = false;
    bool campaignCompleteActive = false;
    int endScreenPhase = 0;
    int endScreenOffset = 0;
    uint64_t endScreenTimerMs = 0;

    // Shared Sprites & UI Icons
    std::array<std::array<std::unique_ptr<Sprite>, 12>, 5> unitTemplates;
    std::vector<ImageRegion> actionIcons;
    std::vector<ImageRegion> menuIcons;
    std::unique_ptr<Sprite> hudIcons;
    std::unique_ptr<Sprite> hudIcons2;
    std::unique_ptr<Sprite> arrowIcons;
    std::unique_ptr<Sprite> sideArrowSprite;
    std::unique_ptr<Sprite> smallArrowSprite;
    std::unique_ptr<Sprite> buttonsSprite;
    std::unique_ptr<Sprite> borderSprite;
    std::unique_ptr<Sprite> bigCircleProto;
    std::unique_ptr<Sprite> smallCircleProto;
    std::unique_ptr<Sprite> smallSparkProto;
    std::unique_ptr<Sprite> smokeProto;
    std::unique_ptr<Sprite> sparkProto;
    std::unique_ptr<Sprite> redsparkProto;
    std::unique_ptr<Sprite> levelupProto;
    std::unique_ptr<Sprite> alphaSprite;
    std::unique_ptr<Sprite> cursorSprite;
    std::unique_ptr<Sprite> portraitsSprite;
    std::unique_ptr<Sprite> unitIcons;
    std::array<std::unique_ptr<Sprite>, 2> kingHeadIcons;

    ImageRegion msLogo;
    ImageRegion aeLogo;
    ImageRegion gameoverLogo;
    std::unique_ptr<Sprite> titleActionArrow;
    int titleWaterOff = 0;

    // Active Panels
    Panel* activePanel = nullptr;
    std::vector<Panel*> panelStack;
    std::unique_ptr<Panel> ownedMainMenu;
    std::unique_ptr<Panel> ownedSubPanel;
    std::unique_ptr<Panel> ownedInGameMenu;
    std::unique_ptr<Panel> ownedPopup;
    std::unique_ptr<Panel> ownedBottomBanner;
    std::unique_ptr<Panel> ownedDialog;

    // Skirmish map names
    std::vector<std::string> skirmishMapNames;
    int selectedSkirmishMap = 0;
    int selectedCampaignStage = 0;
    int skirmishControlSel[4] = {1, 0, 0, 0};
    int skirmishTeamSel[4] = {0, 1, 2, 3};

private:
    void loadAssets();
    void loadMap(int idx);
    void clearMapState();
    void openMainMenu();
    void openSkirmishSetup();
    void openInGameMenu();
    void startActionMenuForUnit(Unit* u);
    void beginPlayerTurn();
    void advanceToNextPlayer();
    void showBanner(const std::string& title, const std::string& body, int autoCloseMs);
    void showSpeech(int strId, int8_t portrait, int8_t side);
    void showConfirmDialog(const std::string& msg, int confirmCode);
    void startBattle(Unit* att, Unit* def);
    void finishBattle();
    void tickBattle();
    void tickAi();
    void aiEvaluateUnit(Unit* u);
    int aiScoreTile(Unit* u, int gx, int gy, Unit* atkTarget, Unit* graveTarget) const;
    void tickCampaignEvents();
    void tickIntro();
    void tickTitle();
    void tickInGame();
    void tickGameOver();

    void drawIntro(engine::GraphicsContext& g);
    void drawTitle(engine::GraphicsContext& g);
    void drawInGame(engine::GraphicsContext& g, float alpha, bool smooth);
    void drawBattle(engine::GraphicsContext& g, float alpha, bool smooth);
    void drawGameOver(engine::GraphicsContext& g);
    void drawTopHud(engine::GraphicsContext& g);
    void drawTransitionCurtain(engine::GraphicsContext& g);

    int countAliveUnits(int8_t typeFilter, int stateFilter, int8_t plr) const;
    void checkVictoryConditions();
    void playBgmTrack(int trackId, int loops = -1);
    void stopBgmTrack();

    int confirmActionCode = 0;
    std::unique_ptr<Panel> confirmPanel;
    std::unique_ptr<Panel> minimapPanel;
    std::unique_ptr<Panel> buyPanel;
    std::unique_ptr<Panel> buyInfoPanel;
    std::unique_ptr<Panel> unitInfoPanel;
    std::unique_ptr<Panel> helpPanel;
    std::unique_ptr<Panel> settingsPanel;
    std::unique_ptr<Panel> selectLevelPanel;
    std::unique_ptr<Panel> victoryPanel;
    int tileFlashAnim = 0;
    bool waterBlink = false;
    uint64_t waterBlinkMs = 0;
    int curBgmTrack = -1;
};

} // namespace game
