//
//  Texture.hpp
//  Illusion
//
//  Created by Prabhat Godse on 8/5/16.
//  Copyright © 2016 biodigital. All rights reserved.
//

#ifndef Texture_hpp
#define Texture_hpp

#include <stdio.h>
#include <vector>
#include <OpenGL/gl3.h>

class Texture {
public:
    enum Type {
        BASE_COLOR,
        CUBE_MAP
    };
    Type type;
    
    GLuint textureId;
    Texture(std::vector<std::string> cubeList);
    Texture(std::string path);
};

#endif /* Texture_hpp */
