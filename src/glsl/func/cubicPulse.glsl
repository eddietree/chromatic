float cubicPulse( float center, float width, float val )
{
    val = abs(val - center);
    if( val>width ) return 0.0;
    val /= width;
    return 1.0 - val*val*(3.0-2.0*val);
}
#pragma glslify: export(cubicPulse)
