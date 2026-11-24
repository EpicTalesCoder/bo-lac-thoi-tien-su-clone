cmake_minimum_required(VERSION 3.16)
project(ancient_empires_2 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(APPLE)
    list(APPEND CMAKE_PREFIX_PATH "/opt/homebrew" "/usr/local")
    if(EXISTS "/tmp/sdl2_frameworks/SDL2.framework")
        list(APPEND CMAKE_FRAMEWORK_PATH "/tmp/sdl2_frameworks")
    endif()
    if(EXISTS "$ENV{HOME}/Library/Frameworks/SDL2.framework")
        list(APPEND CMAKE_FRAMEWORK_PATH "$ENV{HOME}/Library/Frameworks")
    endif()
endif()

find_package(SDL2 QUIET)
find_package(SDL2_image QUIET)
find_package(SDL2_mixer QUIET)
find_package(SDL2_ttf QUIET)

file(GLOB_RECURSE PORT_SOURCES CONFIGURE_DEPENDS
    "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
)

add_executable(ancient_empires_2 ${PORT_SOURCES})

target_include_directories(ancient_empires_2 PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/src"
)

target_compile_definitions(ancient_empires_2 PRIVATE
    PORT_ASSETS_FALLBACK_DIR="${CMAKE_CURRENT_SOURCE_DIR}/assets"
)

target_compile_options(ancient_empires_2 PRIVATE
    -Wall -Wextra -Wno-unused-parameter -fno-rtti -fno-exceptions -O2
)

if(SDL2_FOUND AND TARGET SDL2::SDL2)
    target_link_libraries(ancient_empires_2 PRIVATE SDL2::SDL2)
elseif(APPLE AND EXISTS "/tmp/sdl2_frameworks/SDL2.framework")
    target_compile_options(ancient_empires_2 PRIVATE -F/tmp/sdl2_frameworks)
    target_include_directories(ancient_empires_2 PRIVATE
        "/tmp/sdl2_frameworks/SDL2.framework/Headers"
        "/tmp/sdl2_frameworks/SDL2_image.framework/Headers"
        "/tmp/sdl2_frameworks/SDL2_mixer.framework/Headers"
        "/tmp/sdl2_frameworks/SDL2_ttf.framework/Headers"
    )
    target_link_libraries(ancient_empires_2 PRIVATE
        "-F/tmp/sdl2_frameworks"
        "-Wl,-rpath,/tmp/sdl2_frameworks"
        "-framework SDL2"
        "-framework SDL2_image"
        "-framework SDL2_mixer"
        "-framework SDL2_ttf"
    )
else()
    message(FATAL_ERROR "SDL2 not found")
endif()

if(TARGET SDL2_image::SDL2_image)
    target_link_libraries(ancient_empires_2 PRIVATE SDL2_image::SDL2_image)
elseif(SDL2_FOUND)
    target_link_libraries(ancient_empires_2 PRIVATE SDL2_image)
endif()

if(TARGET SDL2_mixer::SDL2_mixer)
    target_link_libraries(ancient_empires_2 PRIVATE SDL2_mixer::SDL2_mixer)
elseif(SDL2_FOUND)
    target_link_libraries(ancient_empires_2 PRIVATE SDL2_mixer)
endif()

if(TARGET SDL2_ttf::SDL2_ttf)
    target_link_libraries(ancient_empires_2 PRIVATE SDL2_ttf::SDL2_ttf)
elseif(SDL2_FOUND)
    target_link_libraries(ancient_empires_2 PRIVATE SDL2_ttf)
endif()
