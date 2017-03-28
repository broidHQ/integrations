# for f in broid-*/**/**/*.ts; do
#   echo "Append to $f"
#
#   cat broid-alexa/src/core/intex.ts > $f
# done

for dir in broid-* ; do (cd "$dir" && rm -rf core/src/index.ts && touch core/src/index.ts && cat ../intex_template.ts > core/src/index.ts); done
