from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    # read values from text file
    with open('ECG_T.txt', 'r') as f:
        lines = f.readlines()

    # convert to list of tuples
    data = [tuple(map(float, line.strip().split('\t'))) for line in lines]

    # render HTML template with data
    return render_template('index.html', data=data)

if __name__ == '__main__':
    app.run(debug=True)